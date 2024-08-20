import type { Image, PathShape, PcbDesign } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { mm } from "@tscircuit/mm"

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
      .flatMap((el) => el.image.outlines)
      .filter((el) => el.type.includes("path")) as PathShape[]
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
