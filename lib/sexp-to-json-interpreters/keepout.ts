import type { Keepout } from "lib/types"
import { keepoutSchema } from "lib/zod-schema"
import { SHAPE_NAMES, parseSexprShape } from "./shape"

export function parseSexprKeepout(value: any[]): Keepout {
  const keepoutObj: Partial<Keepout> = {}

  if (typeof value[0] === "string") {
    keepoutObj.id = value[0]
    value = value.slice(1)
  }

  value.forEach((v: any) => {
    const [key, ...rest] = v
    if (SHAPE_NAMES.has(key)) {
      keepoutObj.shape = parseSexprShape([key, ...rest])
    } else if (key === "clearance_class") {
      keepoutObj.clearance_class = rest[0]
    }
  })

  return keepoutSchema.parse(keepoutObj)
}
