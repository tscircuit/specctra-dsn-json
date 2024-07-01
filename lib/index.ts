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

  console.log(parsePCBDesign(sexpr))
}

function parsePCBDesign(sexprRoot: any[]): any {
  const result: any = {}

  const [pcbLiteral, filePath, ...sexprMainContent] = sexprRoot

  sexprMainContent.forEach(([key, ...values]) => {
    switch (key) {
      case "parser":
        result.parser = parseObject(parserSchema, values)
        break
      case "resolution":
        result.resolution = parseObject(resolutionSchema, values)
        break
      // case "structure":
      //   result.structure = parseObject(structureSchema, values)
      //   break
      // case "placement":
      //   result.placement = parseObject(placementSchema, values)
      //   break
      // case "library":
      //   result.library = parseObject(librarySchema, values)
      //   break
      // case "network":
      //   result.network = parseObject(networkSchema, values)
      //   break
      // case "wiring":
      //   result.wiring = parseObject(wiringSchema, values)
      //   break
      default: {
        console.log(`WARN: ignoring key ${key}`)
      }
    }
  })

  return pcbDesignSchema.parse(result)
}

function parseObject(schema: any, arrayData: any[]): any {
  const result: any = {}

  if (typeof arrayData[0] === "string" || typeof arrayData[0] === "number") {
    return schema.parse(arrayData)
  } else if (schema instanceof z.ZodObject) {
    arrayData.forEach(([key, value]) => {
      result[key] =
        Array.isArray(value) && value.every(Array.isArray)
          ? value.map((v) => parseObject(schema.shape[key], v))
          : value
    })
  }

  return schema.parse(result)
}
