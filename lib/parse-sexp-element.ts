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

export function parseSexpElements(sexp: any[]): PcbDesign {
  const parsedElements: Partial<PcbDesign> = {
    pcb_id: sexp[1],
  }

  sexp.slice(2).forEach((element) => {
    const elementType = element[0]
    switch (elementType) {
      case "parser":
        parsedElements.parser = parseSexprParser(element.slice(1))
        break
      case "resolution":
        parsedElements.resolution = {
          unit: element[1],
          value: parseFloat(element[2]),
        }
        break
      case "unit":
        parsedElements.unit = element[1]
        break
      case "structure":
        parsedElements.structure = parseSexprStructure(element.slice(1))
        break
      case "placement":
        parsedElements.placement = parseSexprPlacement(element.slice(1))
        break
      case "library":
        parsedElements.library = parseSexprLibrary(element.slice(1))
        break
      case "network":
        parsedElements.network = parseSexprNetwork(element.slice(1))
        break
      case "wiring":
        parsedElements.wiring = parseSexprWiring(element.slice(1))
        break
      default:
        const value = element.slice(1)
        ;(parsedElements as any)[elementType] =
          value.length === 1 ? value[0] : value
        break
    }
  })

  return pcbDesignSchema.parse(parsedElements)
}
