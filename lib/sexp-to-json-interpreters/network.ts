import type { Network, Net, ViaRule, Class } from "../types"
import { networkSchema } from "../zod-schema"
import { parseRule } from "./rule"
import { parseVia } from "./via"

export function parseSexprNetwork(elements: any[]): Network {
  const result: Network = {
    nets: [],
    vias: [],
    via_rules: [],
    classes: [],
  }

  elements.forEach((element) => {
    const [type, ...data] = element

    switch (type) {
      case "net":
        if (!result.nets) result.nets = []
        result.nets.push(parseNet(data))
        break
      case "via":
        if (!result.vias) result.vias = []
        result.vias.push(parseVia(data))
        break
      case "via_rule":
        if (!result.via_rules) result.via_rules = []
        result.via_rules.push(parseViaRule(data))
        break
      case "class":
        if (!result.classes) result.classes = []
        result.classes.push(parseClass(data))
        break
      default:
        console.warn(`Unexpected network element type: ${type}`)
    }
  })

  return networkSchema.parse(result)
}

function parseNet(data: any[]): Net {
  const result: Net = {
    type: "net",
    name: data[0],
    pins: [],
  }

  let pinsIndex = 1

  if (typeof data[1] === "string" && !Array.isArray(data[1])) {
    result.net_number = data[1]
    pinsIndex = 2
  }

  const pinsArray = data.find(
    (item, index) =>
      index >= pinsIndex && Array.isArray(item) && item[0] === "pins"
  )
  if (pinsArray) {
    result.pins = pinsArray.slice(1)
  }

  return result
}

function parseViaRule(data: any[]): ViaRule {
  const [name, via] = data
  return {
    type: "via_rule",
    name,
    via,
  }
}

function parseClass(data: any[]): Class {
  const [name, ...rest] = data
  const result: Class = {
    type: "class",
    name,
    nets: [],
  }

  rest.forEach((item) => {
    if (Array.isArray(item)) {
      switch (item[0]) {
        case "circuit":
          result.circuit = parseCircuit(item.slice(1))
          break
        case "rule":
          result.rule = parseRule(item.slice(1))
          break
        case "clearance_class":
          result.clearance_class = item[1]
          break
        case "via_rule":
          result.via_rule = item[1]
          break
      }
    } else if (item !== "") {
      result.nets.push(item)
    }
  })

  return result
}

function parseCircuit(data: any[]): { [key: string]: string | string[] } {
  const result: { [key: string]: string | string[] } = {}
  data.forEach((item) => {
    const [key, ...values] = item
    result[key] = values.length === 1 ? values[0] : values
  })
  return result
}
