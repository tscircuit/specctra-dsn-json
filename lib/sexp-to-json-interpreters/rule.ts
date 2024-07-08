import type { Rule } from "lib/types"
import { ruleSchema } from "lib/zod-schema"

export function parseRule(value: any[]): Rule {
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
    } else {
      ;(ruleObj as any)[key] = rest[0]
    }
  })

  return ruleSchema.parse(ruleObj)
}
