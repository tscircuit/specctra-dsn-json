import type { Via } from "lib/types"
import { viaSchema } from "lib/zod-schema"

export function parseVia(value: any[]): Via {
  if (value.length === 0) {
    throw new Error("Via array is empty")
  }

  const result: Partial<Via> = {}

  const [padstackId, ...rest] = value

  if (typeof padstackId !== "string") {
    throw new Error("First element of via array must be a string (padstack_id)")
  }

  result.padstack_id = padstackId

  if (isCoordinates(rest)) {
    const [x, y, ...properties] = rest
    result.x = Number(x)
    result.y = Number(y)
    parseProperties(result, properties)
  } else {
    parseSparePadstacks(result, rest)
  }

  return viaSchema.parse(result)
}

function isCoordinates(values: any[]): boolean {
  return (
    values.length >= 2 &&
    typeof values[0] === "string" &&
    typeof values[1] === "string" &&
    !isNaN(Number(values[0])) &&
    !isNaN(Number(values[1]))
  )
}

function parseProperties(result: Partial<Via>, properties: any[]): void {
  properties.forEach((item) => {
    if (Array.isArray(item) && item.length >= 2) {
      const [key, ...subValues] = item
      switch (key) {
        case "net":
          result.net = subValues[0]
          if (subValues[1]) result.net_code = subValues[1]
          break
        case "type":
          result.via_type = subValues[0]
          break
        case "clearance_class":
          result.clearance_class = subValues[0]
          break
      }
    }
  })
}

function parseSparePadstacks(result: Partial<Via>, values: any[]): void {
  if (values.length === 1 && typeof values[0] === "string") {
    result.spare_padstack_ids = [values[0]]
  } else if (
    values.length === 2 &&
    typeof values[0] === "string" &&
    typeof values[1] === "string"
  ) {
    result.spare_padstack_ids = [values[0]]
    result.property = values[1]
  } else {
    result.spare_padstack_ids = values.filter((v) => typeof v === "string")
  }
}
