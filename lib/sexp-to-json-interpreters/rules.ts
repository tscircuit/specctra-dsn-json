import type { DsnRules } from "../types"
import { dsnRulesSchema, layerRuleSchema } from "../zod-schema"
import { parseSexprPadstack } from "./library"
import {
  parseSexprCircuit,
  parseSexprClass,
  parseViaRule,
} from "./network"
import { parseSexprParser } from "./parser"
import { parseSexprRule } from "./rule"
import {
  parseSexprAutorouteSettings,
  parseSexprControl,
  parseSexprLayerRule,
} from "./structure"
import { parseSexprVia } from "./via"

export function parseSexprRules(sexp: any[]): DsnRules {
  let rulesId = ""
  let startIndex = 0

  if (sexp[0] === "rules") {
    if (sexp[1] === "PCB" && typeof sexp[2] === "string") {
      rulesId = sexp[2]
      startIndex = 3
    } else if (typeof sexp[1] === "string") {
      rulesId = sexp[1]
      startIndex = 2
    } else {
      startIndex = 1
    }
  } else if (typeof sexp[0] === "string" && !Array.isArray(sexp[0])) {
    rulesId = sexp[0] === "PCB" && typeof sexp[1] === "string" ? sexp[1] : sexp[0]
    startIndex = sexp[0] === "PCB" && typeof sexp[1] === "string" ? 2 : 1
  }

  const parsed: Partial<DsnRules> = {
    rules_id: rulesId,
  }

  sexp.slice(startIndex).forEach((element) => {
    if (!Array.isArray(element)) return
    const [key, ...value] = element

    switch (key) {
      case "version":
        parsed.version = isNaN(value[0]) ? value[0] : parseFloat(value[0])
        break
      case "parser":
        parsed.parser = parseSexprParser(value)
        break
      case "resolution":
        parsed.resolution = {
          unit: value[0],
          value: parseFloat(value[1]),
        }
        break
      case "unit":
        parsed.unit = value[0]
        break
      case "snap_angle":
        parsed.snap_angle = value[0] as "fortyfive_degree" | "ninety_degree"
        break
      case "control":
        parsed.control = parseSexprControl(value)
        break
      case "autoroute_settings":
        parsed.autoroute_settings = parseSexprAutorouteSettings(value)
        break
      case "layer_rule":
        parsed.layer_rules = parsed.layer_rules || []
        parsed.layer_rules.push(
          layerRuleSchema.parse(parseSexprLayerRule(value))
        )
        break
      case "padstack":
        parsed.padstacks = parsed.padstacks || []
        parsed.padstacks.push(parseSexprPadstack(value))
        break
      case "via":
        parsed.vias = parsed.vias || []
        parsed.vias.push(parseSexprVia(value))
        break
      case "via_rule":
        parsed.via_rules = parsed.via_rules || []
        parsed.via_rules.push(parseViaRule(value))
        break
      case "rule":
        parsed.rules = parsed.rules || []
        parsed.rules.push(parseSexprRule(value))
        break
      case "class":
        parsed.classes = parsed.classes || []
        parsed.classes.push(parseSexprClass(value))
        break
      case "circuit":
        parsed.circuit = parseSexprCircuit(value)
        break
      default:
        ;(parsed as any)[key] = value.length === 1 ? value[0] : value
        break
    }
  })

  return dsnRulesSchema.parse(parsed)
}
