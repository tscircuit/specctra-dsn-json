import { placementSchema } from "../zod-schema"
import type { Placement, Place } from "../types"

export function parseSexprPlacement(elements: any[]): Placement {
  const placement: Placement = []

  elements.forEach((element) => {
    const [elementType, elementName, ...placementElements] = element
    if (elementType !== "component") return

    const componentPlacement: {
      component: string
      places: Place[]
    } = {
      component: elementName,
      places: placementElements.map(parsePlace),
    }

    placement.push(componentPlacement)
  })

  return placementSchema.parse(placement)
}

function parsePlace(placeElement: any[]): Place {
  const [, componentId, x, y, side, rotation, ...properties] = placeElement
  const place: Place = {
    component_id: componentId,
    x: parseFloat(x),
    y: parseFloat(y),
    side: side as "front" | "back",
    rotation: parseFloat(rotation),
  }

  properties.forEach((prop: any[]) => {
    if (prop[0] === "PN") {
      place.part_number = prop[1]
    } else if (prop[0] === "pin") {
      if (!place.pins) {
        place.pins = []
      }
      place.pins.push({
        pin_id: prop[1],
        clearance_class: prop[2][1],
      })
    }
  })

  return place
}
