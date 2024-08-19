import type { Image, PcbDesign, Shape, Structure } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { convertPcbStructureElementToSoup } from "./pcb-element-to-soup-converters/pcb-structure"

export const convertPcbJsonToTscircuitSoupJson = (pcb: PcbDesign) => {
  const soupElements: AnySoupElement[] = []

  const pcbComponents = pcb.placement.flatMap((component) => component.places)

  for (const [
    index,
    { component_id, x, y, side, rotation },
  ] of pcbComponents.entries()) {
    const soupElementId = index + 1
    const componentFunctionalType = "simple_bug" // TODO figure out ftype
    const soupSourceComponent = Soup.any_source_component.parse({
      type: "source_component",
      source_component_id: `source_component_${soupElementId}`,
      name: component_id,
      ftype: componentFunctionalType,
    })

    const pcbComponentName = pcb.placement.find((p) =>
      p.places.some((p) => p.component_id === component_id)
    )?.component
    const pcbComponentOutlines = pcb.library
      .filter((el) => "image" in el)
      .filter((el) => el.image.name === pcbComponentName)
    const pcbComponentDimensions = calculatePcbComponentDimensions(
      pcbComponentOutlines
    ) ?? { width: 0, height: 0 }

    const soupPcbComponent = Soup.pcb_component.parse({
      type: "pcb_component",
      pcb_component_id: `pcb_component_${soupElementId}`,
      source_component_id: `source_component_${soupElementId}`,
      name: component_id,
      ftype: componentFunctionalType,
      width: pcbComponentDimensions.width,
      height: pcbComponentDimensions.height,
      rotation,
      center: { x, y },
      layer: side === "front" ? "top" : "bottom",
    })

    soupElements.push(soupSourceComponent, soupPcbComponent)
  }

  return soupElements
}

function calculatePcbComponentDimensions(outlines: any) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  if (!("coordinated" in outlines[0])) return

  outlines.forEach((outline: any) => {
    outline.coordinates.forEach((coord: any) => {
      const [x, y] = coord
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    })
  })

  // Calculate dimensions in original units
  const width = maxX - minX
  const height = maxY - minY

  // Convert to mm (assuming original units are in 0.1 mils)
  // 1 mil = 0.0254 mm, so 0.1 mil = 0.00254 mm
  const widthMm = width * 0.00254
  const heightMm = height * 0.00254

  return { width: widthMm, height: heightMm }
}
