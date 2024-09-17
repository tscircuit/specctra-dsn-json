import type { PathShape, DsnPcbDesign } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnyCircuitElement } from "@tscircuit/soup"
import { mm } from "@tscircuit/mm"
import {
  extractLayerFromPinName,
  isPlatedHole,
  isSmtPad,
  parsePinName,
} from "./parse-pin-name"

export const convertDsnJsonToTscircuitSoupJson = (
  pcb: DsnPcbDesign,
): AnyCircuitElement[] => {
  const soupElements: AnyCircuitElement[] = []

  const pcbComponents = pcb.placement.flatMap((component) => component.places)

  for (const [
    index,
    { component_id, x, y, side, rotation },
  ] of pcbComponents.entries()) {
    const componentSoupElements: AnyCircuitElement[] = []
    const soupSourceComponentId = index + 1
    const componentFunctionalType = "simple_bug" // TODO figure out ftype
    const soupSourceComponent = Soup.any_source_component.parse({
      type: "source_component",
      source_component_id: `source_component_${soupSourceComponentId}`,
      name: component_id,
      ftype: componentFunctionalType,
    })

    const pcbComponentName = pcb.placement.find((p) =>
      p.places.some((p) => p.component_id === component_id),
    )?.component

    const pcbImages = pcb.library.filter((el) => "image" in el)
    const pcbComponentImage = pcbImages.find(
      (el) => el.image.name === pcbComponentName,
    )?.image
    if (!pcbComponentImage) {
      throw new Error(`PCB component image not found: ${pcbComponentName}`)
    }

    const pcbComponentOutlines = pcbComponentImage.outlines.filter((el) =>
      el.type.includes("path"),
    ) as PathShape[]
    const pcbComponentDimensions = calculatePcbComponentDimensions(
      pcbComponentOutlines,
    ) ?? { width: 0, height: 0 }

    const soupPcbComponent = Soup.pcb_component.parse({
      type: "pcb_component",
      pcb_component_id: `pcb_component_${soupSourceComponentId}`,
      source_component_id: `source_component_${soupSourceComponentId}`,
      name: component_id,
      ftype: componentFunctionalType,
      width: pcbComponentDimensions.width,
      height: pcbComponentDimensions.height,
      rotation,
      center: { x, y },
      layer: side === "front" ? "top" : "bottom",
    })

    componentSoupElements.push(soupSourceComponent, soupPcbComponent)

    pcbComponentImage.pins.sort(
      (a, b) => Number(a.pin_number) - Number(b.pin_number),
    )

    const pcbComponentSmtPads = pcbComponentImage.pins.filter(({ name }) =>
      isSmtPad(name),
    )
    for (const { pin_number, x, y, name } of pcbComponentSmtPads) {
      const { shape, layer, width, height, radius } = parsePinName(name)
      const soupSourcePort = Soup.source_port.parse({
        type: "source_port",
        source_port_id: `source_port_${pin_number}`,
        source_component_id: soupSourceComponent.source_component_id,
        name: pin_number,
      })

      const pad = {
        pcb_smtpad_id: `pcb_smtpad_${pin_number}`,
        pcb_component_id: soupPcbComponent.pcb_component_id,
        pcb_port_id: soupSourcePort.source_port_id,
        type: "pcb_smtpad",
        x: mm(x),
        y: mm(y),
        shape,
        layer,
        width,
        height,
        ...(radius ? { radius } : {}),
      }
      const soupPcbPin = Soup.pcb_smtpad.parse(pad)

      componentSoupElements.push(soupSourcePort, soupPcbPin)
      soupElements.push(...componentSoupElements)
    }

    const pcbComponentPlatedHoles = pcbComponentImage.pins.filter(({ name }) =>
      isPlatedHole(name),
    )
  }

  return soupElements
}

function calculatePcbComponentDimensions(outlines: PathShape[]) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  if (outlines[0] && !("coordinates" in outlines[0])) return

  outlines.forEach((outline) => {
    outline.coordinates.forEach((coord) => {
      const [x, y] = coord
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })
  })

  const width = maxX - minX
  const height = maxY - minY

  return { width: mm(width), height: mm(height) }
}
