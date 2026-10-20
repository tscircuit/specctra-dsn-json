import type { Rule } from "lib/types"
import { ruleSchema } from "lib/zod-schema"

export function parseSexprRule(value: any[]): Rule {
  const ruleObj: Partial<Rule> = {}

  value.forEach((v: any) => {
    const [key, ...rest] = v
    if (key === "width") {
      ruleObj.width = parseFloat(rest[0])
    } else if (key === "clearance" || key === "clear") {
      ruleObj.clearances = ruleObj.clearances || []
      const clearanceObj: { value: number; type?: string } = {
        value: parseFloat(rest[0]),
      }
      if (rest.length > 1 && rest[1][0] === "type") {
        clearanceObj.type = rest[1][1]
      }
      ruleObj.clearances.push(clearanceObj)
    } else if (key === "length") {
      ruleObj.length = {
        min: parseFloat(rest[0]),
        max: parseFloat(rest[1]),
      }
    } else if (key === "via_costs") {
      ruleObj.via_costs = parseFloat(rest[0])
    } else if (key === "layer_change_costs") {
      ruleObj.layer_change_costs = parseFloat(rest[0])
    } else {
      ;(ruleObj as any)[key] = rest[0]
    }
  })

  return ruleSchema.parse(ruleObj)
}
