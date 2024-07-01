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
import { z } from "zod"
import { readFileSync, writeFileSync } from "fs"

export const parseDsnToJson = (dsn: string) => {
  // Many files feature a line that breaks the s-expression parser
  // that looks like this: `(string_quote ")`, the unterminated quote
  // confuses the parser. To avoid this we just remove it.

  dsn = dsn.replace(`(string_quote ")`, ``)

  // NOTE: this does not throw- it will return an error if parsing fails
  const sexpr = parseSExpression(dsn)

  // recursively replace String class instances with regular strings
  replaceStringClassesDeep(sexpr)

  console.log(sexpr.slice(0, 7))
  let input
  let objectMap = {} as any
  for (const expr of sexpr) {
    if (expr[0] === "structure") {
      input = expr

      for (const el of expr.slice(1)) {
        const subEl = "autoroute_settings"
        if (el[0] === subEl) {
          if (!objectMap[subEl]) {
            objectMap[subEl] = []
          }

          objectMap[subEl].push(el)
        }
      }
    }
  }

  const output = JSON.parse(readFileSync("output.json", "utf-8"))

  output.push(objectMap)

  writeFileSync("output.json", JSON.stringify(output, null, 2))

  // console.log(JSON.stringify(output, null, '  '))
  // console.log(parsePCBDesign(sexpr))
}

function parsePCBDesign(sexprRoot: any[]): any {
  const result: any = {}

  const [pcbLiteral, filePath, ...sexprMainContent] = sexprRoot

  result.pcb = pcbLiteral
  result.file = filePath

  sexprMainContent.forEach(([key, ...values]) => {
    switch (key) {
      case "parser":
        result.parser = parseObject(ParserSchema, values)
        break
      case "resolution":
        result.resolution = parseObject(ResolutionSchema, values)
        break
      case "unit":
        result.unit = values[0]
        break
      // case "structure":
      //   result.structure = parseObject(StructureSchema, values)
      //   break
      // case "placement":
      //   result.placement = parseObject(PlacementSchema, values)
      //   break
      // case "library":
      //   result.library = parseObject(LibrarySchema, values)
      //   break
      // case "network":
      //   result.network = parseObject(NetworkSchema, values)
      //   break
      // case "wiring":
      //   result.wiring = parseObject(WiringSchema, values)
      //   break
      default: {
        console.log(`WARN: ignoring key ${key}`)
      }
    }
  })

  return PCBDesignSchema.parse(result)
}

function parseObject(schema: any, arrayData: any[]): any {
  const result: any = {}

  if (typeof arrayData[0] === "string" || typeof arrayData[0] === "number") {
    return schema.parse(arrayData)
  } else if (schema instanceof z.ZodObject) {
    arrayData.forEach(([key, ...values]) => {
      result[key] =
        Array.isArray(values) && values.every(Array.isArray)
          ? values.map((v) => parseObject(schema.shape[key], v))
          : values.length > 1
          ? values
          : values[0]
    })
  }

  return schema.parse(result)
}
