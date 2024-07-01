import { parseOnOffValue } from "."
import type { Parser } from "lib/types"

export function parseSexprParser(element: any[]): Parser {
  const parserElement: Parser = {}

  element.forEach((e) => {
    switch (e[0]) {
      case "space_in_quoted_tokens":
        parserElement.space_in_quoted_tokens = parseOnOffValue(e[1])
        break
      case "host_cad":
        parserElement.host_cad = e[1]
        break
      case "host_version":
        parserElement.host_version = e[1]
        break
      case "constant":
        if (!parserElement.constant) {
          parserElement.constant = {}
        }
        parserElement.constant[e[1][0]] = e[1][1]
        break
      case "generated_by_freeroute":
        parserElement.generated_by_freeroute = true
        break
    }
  })

  return parserElement
}
