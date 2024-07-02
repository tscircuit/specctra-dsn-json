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
      case "constant":
        parserElement.constant = {
          ...(parserElement.constant || {}),
          [values[0][0]]: values[0][1],
        }
        break
      case "generated_by_freeroute":
        parserElement.generated_by_freeroute = true
        break
    }
  })

  return parserSchema.parse(parserElement)
}
