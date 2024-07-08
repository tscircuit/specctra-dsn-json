import type { Wiring, Wire } from "../types"
import { wireSchema, wiringSchema } from "../zod-schema"
import { parseSexprVia as parseSexprVia } from "./via"
import { parseSexprShape, SHAPE_NAMES } from "./shape"

export function parseSexprWiring(elements: any[]): Wiring {
  const result: Wiring = {
    wires: [],
    vias: [],
  }

  elements.forEach((element) => {
    const [type, ...data] = element

    switch (type) {
      case "wire":
        result.wires.push(parseSexprWire(data))
        break
      case "via":
        result.vias.push(parseSexprVia(data))
        break
      default:
        console.warn(`Unexpected wiring element type: ${type}`)
    }
  })

  return wiringSchema.parse(result)
}

function parseSexprWire(data: any[]): Wire {
  const result: Partial<Wire> = {}

  data.forEach((item) => {
    if (Array.isArray(item)) {
      const [key, ...values] = item
      if (SHAPE_NAMES.has(key)) {
        result.shape = parseSexprShape([key, ...values])
      } else {
        switch (key) {
          case "net":
            result.net = values[0]
            break
          case "type":
            result.type = values[0]
            break
          case "clearance_class":
            result.clearance_class = values[0]
            break
        }
      }
    }
  })

  return wireSchema.parse(result)
}
