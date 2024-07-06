import type { Via } from "lib/types"
import { viaSchema } from "lib/zod-schema"

export function parseVia(value: any[]): Via {
  const [primary_padstack, ...spare_padstacks] = value
  return viaSchema.parse({ type: "via", primary_padstack, spare_padstacks })
}
