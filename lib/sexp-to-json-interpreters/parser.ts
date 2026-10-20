import { parseOnOffValue } from "."
import type { Parser } from "../types"
import { parserSchema } from "../zod-schema"

export function parseSexprParser(elements: any[]): Parser {
  const parserElement: Partial<Parser> = {}

  elements.forEach(([key, ...values]) => {
    switch (key) {
      case "space_in_quoted_tokens":
        parserElement.space_in_quoted_tokens = parseOnOffValue(values[0])
        break
      case "host_cad":
        parserElement.host_cad = values[0]
        break
      case "host_version":
        parserElement.host_version = values[0]
        break
      case "constant": {
        const [constKey, constVal] = Array.isArray(values[0])
          ? values[0]
          : values
        parserElement.constant = {
          ...(parserElement.constant || {}),
          [constKey]: String(constVal),
        }
        break
      }
      case "write_resolution": {
        const entry: [string, number] = Array.isArray(values[0])
          ? [values[0][0], parseFloat(values[0][1])]
          : [values[0], parseFloat(values[1])]
        parserElement.write_resolution = [
          ...(parserElement.write_resolution || []),
          entry,
        ]
        break
      }
      case "routes_include":
        parserElement.routes_include = Array.isArray(values[0])
          ? values[0]
          : values
        break
      case "wires_include":
        parserElement.wires_include = values[0]
        break
      case "case_sensitive":
        parserElement.case_sensitive = parseOnOffValue(values[0])
        break
      case "rotate_first":
        parserElement.rotate_first = parseOnOffValue(values[0])
        break
      case "generated_by_freeroute":
        parserElement.generated_by_freeroute =
          values.length > 0 ? Boolean(parseOnOffValue(values[0])) : true
        break
    }
  })

  return parserSchema.parse(parserElement)
}
