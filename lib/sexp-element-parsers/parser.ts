import type { Parser } from "lib/parse-sexp-element"

export function parseSexprParser(element: any[]): Parser {
  const parserElement: Parser = {}

  element.forEach((e) => {
    if (e[0] === "space_in_quoted_tokens") {
      parserElement.space_in_quoted_tokens = e[1]
    } else if (e[0] === "host_cad") {
      parserElement.host_cad = e[1]
    } else if (e[0] === "host_version") {
      parserElement.host_version = e[1]
    }
  })

  return parserElement
}
