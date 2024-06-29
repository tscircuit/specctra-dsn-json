interface ParsedElement {
  pcb_id?: string
  parser?: Parser
  resolution?: Resolution
  unit?: Unit
  structure?: any
}

interface Parser {
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

function parseDsnElement(dsn: any[]): ParsedElement {
  const parsedElement: ParsedElement = {
    pcb_id: dsn[1],
  }

  dsn.slice(1).forEach((element) => {
    const elementType = element[0]
    switch (elementType) {
      case "pcb":
        parsedElement.pcb_id = element[1]
        break
      case "parser":
        parsedElement.parser = parseParser(element.slice(1))
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
        parsedElement.structure = parseStructure(element.slice(1))
        break
      // Add more cases for other element types if needed
    }
  })

  return parsedElement
}

function parseParser(element: any[]): Parser {
  const parserElement: Parser = {}

  element.forEach((e) => {
    if (e[0] === "space_in_quoted_tokens") {
      parserElement.space_in_quoted_tokens = e[1]
    } else if (e[0] === "host_cad") {
      parserElement.host_cad = e[1]
    } else if (e[0] === "host_version") {
      parserElement.host_version = e[1]
    } else if (e[0] === "constant" && Array.isArray(e[1])) {
      // Initialize the constant object if it's not already initialized
      if (!parserElement.constant) {
        parserElement.constant = {}
      }
      // Add the constant key-value pair
      parserElement.constant[e[1][0]] = e[1][1]
    }
  })

  return parserElement
}

function parseStructure(elements: any[]): any {
  const parsed: any = {}

  elements.forEach((element) => {
    const key = element[0]
    const value = element.slice(1)

    if (key === "layer") {
      const name = value[0]
      const rest = value.slice(1)

      if (!parsed[key]) {
        parsed[key] = []
      }

      const layerObj = parseStructure(rest)
      parsed[key].push({ name, ...layerObj })
    } else if (key === "property" && Array.isArray(value[0])) {
      const propertyName = value[0][0]
      const propertyValue = value[0][1]
      parsed[key] = { name: propertyName, value: propertyValue }
    } else if (key === "boundary") {
      if (!parsed[key]) {
        parsed[key] = []
      }

      const boundaryType = value[0][0]
      const boundaryLayer = value[0][1]
      const rest = value[0].slice(2)

      let boundaryWidth
      let coordinatesStartIndex = 0

      if (rest.length % 2 !== 0) {
        // If odd number of remaining elements, the third element is width
        boundaryWidth = parseFloat(rest[0])
        coordinatesStartIndex = 1
      }

      const boundaryValues = rest.slice(coordinatesStartIndex)
      const coordinates = []

      for (let i = 0; i < boundaryValues.length; i += 2) {
        coordinates.push({
          x: parseFloat(boundaryValues[i]),
          y: parseFloat(boundaryValues[i + 1]),
        })
      }

      const boundaryObject: any = {
        type: boundaryType,
        layer: boundaryLayer,
        coordinates: coordinates,
      }

      if (boundaryWidth !== undefined) {
        boundaryObject.width = boundaryWidth
      }

      parsed[key].push(boundaryObject)
    } else if (key === "keepout") {
      if (!parsed[key]) {
        parsed[key] = []
      }

      const keepoutObj: any = { type: "keepout" }
      let shape = {}
      let rule = {}

      let keepoutDetails = value
      if (typeof keepoutDetails[0] === "string") {
        keepoutObj.id = keepoutDetails[0]

        keepoutDetails = keepoutDetails.slice(1)
      }

      keepoutDetails.forEach((v: any) => {
        if (v[0] === "polygon") {
          const shapeType = v[0]
          const shapeLayer = v[1]
          const apertureWidth = v[2]
          const vertices = []
          for (let i = 3; i < v.length; i += 2) {
            vertices.push([parseFloat(v[i]), parseFloat(v[i + 1])])
          }

          shape = {
            type: shapeType,
            layer: shapeLayer,
            aperture_width: apertureWidth,
            vertices: vertices,
          }
        } else if (v[0] === "clearance_class") {
          rule = {
            type: "clearance_class",
            value: v[1],
          }
        }
      })

      keepoutObj.shape = shape
      if (Object.keys(rule).length > 0) {
        keepoutObj.rule = rule
      }

      parsed[key].push(keepoutObj)
    } else if (Array.isArray(value[0])) {
      if (!parsed[key]) {
        parsed[key] = []
      }
      parsed[key].push(parseStructure(value))
    } else {
      parsed[key] = value.length === 1 ? value[0] : value
    }
  })

  return parsed
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
    // ["via", "Via[0-1]_600:400_um", "Via[0-1]_1016:485.7_um"],
    // [
    //   "rule",
    //   ["width", "250"],
    //   ["clearance", "200.1"],
    //   ["clearance", "200.1", ["type", "default_smd"]],
    //   ["clearance", "50", ["type", "smd_smd"]],
    // ],
  ],
]

const parsedDsn = parseDsnElement(exampleDsn)
console.log(JSON.stringify(parsedDsn, null, 2))
