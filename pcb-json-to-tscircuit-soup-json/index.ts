import type { PathShape, DsnPcbDesign } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { mm } from "@tscircuit/mm"
import { isPlatedHole, isSmtPad, parsePadName } from "./parse-pad-name"

export const convertDsnJsonToTscircuitSoupJson = (
  pcb: DsnPcbDesign
): AnySoupElement[] => {
  const soupElements: AnySoupElement[] = []

  const pcbComponents = pcb.placement.flatMap((component) => component.places)
  const pcbImages = pcb.library.filter((el) => "image" in el)

  for (const [
    index,
    { component_id, x, y, side, rotation },
  ] of pcbComponents.entries()) {
    const componentSoupElements: AnySoupElement[] = []
    const soupSourceComponentId = index + 1
    const componentFunctionalType = "simple_bug" // TODO figure out ftype
    const soupSourceComponent = Soup.any_source_component.parse({
      type: "source_component",
      source_component_id: `source_component_${soupSourceComponentId}`,
      name: component_id,
      ftype: componentFunctionalType,
    })

    const pcbComponentName = pcb.placement.find((p) =>
      p.places.some((p) => p.component_id === component_id)
    )?.component

    const pcbComponentImage = pcbImages.find(
      (el) => el.image.name === pcbComponentName
    )?.image
    if (!pcbComponentImage) {
      throw new Error(`PCB component image not found: ${pcbComponentName}`)
    }

    const pcbComponentOutlines = pcbComponentImage.outlines.filter((el) =>
      el.type.includes("path")
    ) as PathShape[]
    const pcbComponentDimensions = calculatePcbComponentDimensions(
      pcbComponentOutlines
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
      (a, b) => Number(a.pin_number) - Number(b.pin_number)
    )

    const pcbComponentSmtPads = pcbComponentImage.pins.filter(({ name }) =>
      isSmtPad(name)
    )
    for (const { pin_number, x, y, name } of pcbComponentSmtPads) {
      const { shape, layer, width, height, diameter } = parsePadName(name)
      const soupSourcePort = Soup.source_port.parse({
        type: "source_port",
        source_port_id: `source_port_${pin_number}`,
        source_component_id: soupSourceComponent.source_component_id,
        name: pin_number,
      })

      const padShapeMap = {
        Round: "circle",
        Oval: "circle",
        RoundRect: "rect",
        Rect: "rect",
        Cust: "rect",
      }
      const padLayerMap = {
        A: "top",
        T: "top",
        B: "bottom",
      }

      const smtPad = {
        pcb_smtpad_id: `pcb_smtpad_${pin_number}`,
        pcb_component_id: soupPcbComponent.pcb_component_id,
        pcb_port_id: soupSourcePort.source_port_id,
        type: "pcb_smtpad",
        x: mm(x),
        y: mm(y),
        shape: padShapeMap[shape as keyof typeof padShapeMap],
        layer: padLayerMap[layer as keyof typeof padLayerMap],
        width,
        height,
        ...(diameter && { radius: diameter / 2 }),
      }

      if (shape === "RoundRect") {
        // Transforming round rect pad into rect because tscircuit json only supports rect
        const padShape = pcb.library
          .filter((el) => "padstack" in el)
          .find((p) => p.padstack.name === name)?.padstack.shapes[0]

        if (!padShape) {
          throw new Error(`${name} pad shape not found in the pcb dsn library`)
        }

        if (padShape.type !== "polygon") {
          throw new Error(
            `Invalid pad shape type ${padShape.type} for round rect pad. Expected polygon`
          )
        }

        const { width, height } = roundRectCoordinatesToRect(
          padShape.coordinates
        )

        smtPad.width = width
        smtPad.height = height
      }

      const soupPcbPin = Soup.pcb_smtpad.parse(smtPad)

      componentSoupElements.push(soupSourcePort, soupPcbPin)
      soupElements.push(...componentSoupElements)
    }

    const pcbComponentPlatedHoles = pcbComponentImage.pins.filter(({ name }) =>
      isPlatedHole(name)
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

function roundRectCoordinatesToRect(roundRectCoords: [number, number][]) {
  const xCoords = roundRectCoords.map((coord) => coord[0])
  const yCoords = roundRectCoords.map((coord) => coord[1])
  const width = Math.max(...xCoords) - Math.min(...xCoords)
  const height = Math.max(...yCoords) - Math.min(...yCoords)

  return { width: mm(width), height: mm(height) }
}
