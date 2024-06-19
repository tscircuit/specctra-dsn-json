import parseSExpression from "s-expression"
import { replaceStringClassesDeep } from "./replaceStringClassesDeep"
import {
  LibrarySchema,
  NetworkSchema,
  PCBDesignSchema,
  ParserSchema,
  PlacementSchema,
  ResolutionSchema,
  StructureSchema,
  WiringSchema,
} from "./zod-schema"
import type { z } from "zod"

export const parseDsnToJson = (dsn: string) => {
  // Many files feature a line that breaks the s-expression parser
  // that looks like this: `(string_quote ")`, the unterminated quote
  // confuses the parser. To avoid this we just remove it.

  dsn = dsn.replace(`(string_quote ")`, ``)

  // NOTE: this does not throw- it will return an error if parsing fails
  const sexpr = parseSExpression(dsn)

  // recursively replace String class instances with regular strings
  replaceStringClassesDeep(sexpr)

  console.log(sexpr)

  // console.log(parsePCBDesign(sexpr))
}

function parsePCBDesign(arrayData: any[]): any {
  const result: any = {}

  arrayData.forEach(([key, value]) => {
    switch (key) {
      case "parser":
        result.parser = parseObject(ParserSchema, value)
        break
      case "resolution":
        result.resolution = parseObject(ResolutionSchema, value)
        break
      case "structure":
        result.structure = parseObject(StructureSchema, value)
        break
      case "placement":
        result.placement = parseObject(PlacementSchema, value)
        break
      case "library":
        result.library = parseObject(LibrarySchema, value)
        break
      case "network":
        result.network = parseObject(NetworkSchema, value)
        break
      case "wiring":
        result.wiring = parseObject(WiringSchema, value)
        break
      default:
        result[key] = value
    }
  })

  return PCBDesignSchema.parse(result)
}

function parseObject(schema: z.AnyZodObject, arrayData: any[]): any {
  const result: any = {}

  arrayData.forEach(([key, value]) => {
    result[key] =
      Array.isArray(value) && value.every(Array.isArray)
        ? value.map((v) => parseObject(schema.shape[key], v))
        : value
  })

  return schema.parse(result)
}
