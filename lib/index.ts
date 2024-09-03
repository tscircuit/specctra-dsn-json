import parseSExpression from "s-expression"
import { replaceStringClassesDeep } from "./replaceStringClassesDeep"
import {
  librarySchema,
  networkSchema,
  pcbDesignSchema,
  parserSchema,
  placementSchema,
  resolutionSchema,
  structureSchema,
  wiringSchema,
} from "./zod-schema"
import { z } from "zod"
import { parseSexpElements } from "./parse-sexp-element"
import type { DsnPcbDesign } from "./types"

export const parseDsnToJson = (dsnRaw: string): DsnPcbDesign => {
  // Many files feature a line that breaks the s-expression parser
  // that looks like this: `(string_quote ")`, the unterminated quote
  // confuses the parser. To avoid this we just remove it.

  const dsn = dsnRaw.replace(`(string_quote ")`, "")

  // NOTE: this does not throw- it will return an error if parsing fails
  const sexpr = parseSExpression(dsn)

  // recursively replace String class instances with regular strings
  replaceStringClassesDeep(sexpr)

  return parseSexpElements(sexpr)
}
