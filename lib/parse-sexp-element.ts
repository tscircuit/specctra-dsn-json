import {
  parseSexprLibrary,
  parseSexprNetwork,
  parseSexprParser,
  parseSexprPlacement,
  parseSexprStructure,
  parseSexprWiring,
} from "./sexp-to-json-interpreters"
import type { PcbDesign } from "./types"
import { pcbDesignSchema } from "./zod-schema"

export function parseSexpElement(sexp: any[]): PcbDesign {
  const parsedElement: Partial<PcbDesign> = {
    pcb_id: sexp[1],
  }

  sexp.slice(2).forEach((element) => {
    const elementType = element[0]
    switch (elementType) {
      case "parser":
        parsedElement.parser = parseSexprParser(element.slice(1))
        break
      case "resolution":
        parsedElement.resolution = {
          unit: element[1],
          value: parseFloat(element[2]),
        }
        break
      case "unit":
        parsedElement.unit = element[1]
        break
      case "structure":
        parsedElement.structure = parseSexprStructure(element.slice(1))
        break
      case "placement":
        parsedElement.placement = parseSexprPlacement(element.slice(1))
        break
      case "library":
        parsedElement.library = parseSexprLibrary(element.slice(1))
        break
      case "network":
        parsedElement.network = parseSexprNetwork(element.slice(1))
        break
      case "wiring":
        parsedElement.wiring = parseSexprWiring(element.slice(1))
        break
      default:
        const value = element.slice(1)
        ;(parsedElement as any)[elementType] =
          value.length === 1 ? value[0] : value
        break
    }
  })

  return pcbDesignSchema.parse(parsedElement)
}
