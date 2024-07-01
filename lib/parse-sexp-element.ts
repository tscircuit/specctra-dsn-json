import { parseSexprParser } from "./sexp-element-parsers/parser"
import { parseSexprStructure } from "./sexp-element-parsers/structure"

interface ParsedElement {
  pcb_id?: string
  parser?: Parser
  resolution?: Resolution
  unit?: Unit
  structure?: any
}

export interface Parser {
  space_in_quoted_tokens?: string
  host_cad?: string
  host_version?: string
  constant?: {
    [key: string]: string
  }
}

interface Resolution {
  unit: string
  value: string
}

type Unit = string

function parseSexpElement(sexp: any[]): ParsedElement {
  const parsedElement: ParsedElement = {
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
          value: element[2],
        }
        break
      case "unit":
        parsedElement.unit = element[1]
        break
      case "structure":
        parsedElement.structure = parseSexprStructure(element.slice(1))
        break
      default:
        const value = element.slice(1)
        ;(parsedElement as any)[elementType] =
          value.length === 1 ? value[0] : value
        break
    }
  })

  return parsedElement
}

const exampleDsn = [
  "pcb",
  "E:drv_eKiCad_Projectsdisplay-8-digit-595__freeroute-problemdisplay-8-digit-hc595.dsn",
  [
    "parser",
    ["space_in_quoted_tokens", "on"],
    ["host_cad", "KiCad's Pcbnew"],
    ["host_version", "4.0.7"],
    ["constant", ["pcb_xlo", "-57.1000"]],
  ],
  ["resolution", "um", "10"],
  ["unit", "um"],
  [
    "structure",
    ["layer", "F.Cu", ["type", "signal"], ["property", ["index", "0"]]],
    ["layer", "B.Cu", ["type", "signal"], ["property", ["index", "1"]]],
    [
      "boundary",
      ["rect", "pcb", "34900.0", "-230100.0", "270100.0", "-69900.0"],
    ],
    [
      "boundary",
      [
        "path",
        "pcb",
        "0",
        "265436",
        "-70019",
        "265868",
        "-70076",
        "266294",
        "-70170.4",
        "266710",
        "-70301.5",
        "267113",
        "-70468.5",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "283115",
        "-201577",
        "285713",
        "-203077",
        "287413",
        "-200133",
        "284815",
        "-198633",
        "283115",
        "-201577",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "332086",
        "-199853",
        "333786",
        "-202798",
        "336384",
        "-201298",
        "334684",
        "-198353",
        "332086",
        "-199853",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "267663",
        "-194523",
        "270948",
        "-195403",
        "271724",
        "-192506",
        "268440",
        "-191626",
        "267663",
        "-194523",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "347572",
        "-192446",
        "348348",
        "-195343",
        "351632",
        "-194463",
        "350856",
        "-191566",
        "347572",
        "-192446",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "244905",
        "-187163",
        "244905",
        "-190163",
        "248305",
        "-190163",
        "248305",
        "-187163",
        "244905",
        "-187163",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "206754",
        "-187154",
        "206754",
        "-190154",
        "210154",
        "-190154",
        "210154",
        "-187154",
        "206754",
        "-187154",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "371270",
        "-187011",
        "371270",
        "-190011",
        "374670",
        "-190011",
        "374670",
        "-187011",
        "371270",
        "-187011",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "409497",
        "-187002",
        "409497",
        "-190002",
        "412897",
        "-190002",
        "412897",
        "-187002",
        "409497",
        "-187002",
      ],
    ],
    [
      "keepout",
      "",
      [
        "polygon",
        "signal",
        "0",
        "225728",
        "-184623",
        "225728",
        "-187623",
        "229128",
        "-187623",
        "229128",
        "-184623",
        "225728",
        "-184623",
      ],
    ],
    [
      "via",
      "Via[0-1]_800:400_um",
      "Via[0-1]_800:400_um",
      "Via[0-1]_800:400_um",
      "Via[0-1]_800:400_um",
    ],
    [
      "rule",
      ["width", "250"],
      ["clearance", "200.1"],
      ["clearance", "200.1", ["type", "default_smd"]],
      ["clearance", "50", ["type", "smd_smd"]],
    ],
    ["snap_angle", "fortyfive_degree"],
    ["control", ["via_at_smd", "off"]],
    [
      "autoroute_settings",
      ["fanout", "off"],
      ["autoroute", "on"],
      ["postroute", "on"],
      ["vias", "on"],
      ["via_costs", "50"],
      ["plane_via_costs", "5"],
      ["start_ripup_costs", "100"],
      ["start_pass_no", "1"],
      [
        "layer_rule",
        "F.Cu",
        ["active", "on"],
        ["preferred_direction", "horizontal"],
        ["preferred_direction_trace_costs", "1.0"],
        ["against_preferred_direction_trace_costs", "2.5"],
      ],
      [
        "layer_rule",
        "B.Cu",
        ["active", "on"],
        ["preferred_direction", "vertical"],
        ["preferred_direction_trace_costs", "1.0"],
        ["against_preferred_direction_trace_costs", "1.7"],
      ],
    ],
  ],
]

const parsedDsn = parseSexpElement(exampleDsn)
console.log(JSON.stringify(parsedDsn, null, 2))
