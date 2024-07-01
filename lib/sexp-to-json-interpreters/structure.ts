import { parseOnOffValue } from "."
import {
  structureSchema,
  layerSchema,
  boundarySchema,
  keepoutSchema,
  viaSchema,
  ruleSchema,
  controlSchema,
  autorouteSettingsSchema,
} from "../zod-schema"
import type {
  Structure,
  Layer,
  Boundary,
  Keepout,
  Via,
  Rule,
  Control,
  AutorouteSettings,
} from "../types"

export function parseSexprStructure(elements: any[]): Structure {
  const parsed: Partial<Structure> = {}

  elements.forEach((element) => {
    const [key, ...value] = element

    switch (key) {
      case "layer":
        parsed.layer = parsed.layer || []
        parsed.layer.push(parseLayer(value))
        break
      case "boundary":
        parsed.boundary = parsed.boundary || []
        parsed.boundary.push(parseBoundary(value[0]))
        break
      case "keepout":
        parsed.keepout = parsed.keepout || []
        parsed.keepout.push(parseKeepout(value))
        break
      case "via":
        parsed.via = parseVia(value)
        break
      case "rule":
        parsed.rule = parsed.rule || []
        parsed.rule.push(parseRule(value))
        break
      case "control":
        parsed.control = parseControl(value)
        break
      case "autoroute_settings":
        parsed.autoroute_settings = parseAutorouteSettings(value)
        break
      case "snap_angle":
        parsed.snap_angle = value[0] as "fortyfive_degree" | "ninety_degree"
        break
      default:
        if (Array.isArray(value[0])) {
          ;(parsed as any)[key] = (parsed as any)[key] || []
          ;(parsed as any)[key].push(parseSexprStructure(value))
        } else {
          ;(parsed as any)[key] = value.length === 1 ? value[0] : value
        }
    }
  })

  return structureSchema.parse(parsed)
}

function parseLayer(value: any[]): Layer {
  const [name, ...properties] = value
  const layerObj: Partial<Layer> = { name }

  properties.forEach((prop) => {
    const [key, val] = prop
    if (key === "type") {
      layerObj.type = val
    } else if (key === "property") {
      layerObj.properties = layerObj.properties || {}
      layerObj.properties[val[0]] = val[1]
    }
  })

  return layerSchema.parse(layerObj)
}

function parseBoundary(value: any[]): Boundary {
  const [boundaryType, boundaryLayer, ...rest] = value

  let boundaryWidth: number | undefined
  let coordinatesStartIndex = 0

  if (rest.length % 2 !== 0) {
    boundaryWidth = parseFloat(rest[0])
    coordinatesStartIndex = 1
  }

  const coordinates: [number, number][] = rest
    .slice(coordinatesStartIndex)
    .reduce((acc: [number, number][], curr: string, index: number) => {
      if (index % 2 === 0) {
        acc.push([
          parseFloat(curr),
          parseFloat(rest[coordinatesStartIndex + index + 1]),
        ])
      }
      return acc
    }, [])

  const boundaryObject: Partial<Boundary> = {
    type: boundaryType,
    layer: boundaryLayer,
    coordinates,
    ...(boundaryWidth !== undefined && { width: boundaryWidth }),
  }

  return boundarySchema.parse(boundaryObject)
}

/*
// input
[
    "keepout",
    "",
    [
        "polygon",
        "signal",
        "0",
        "19220",
        "-19695",
        "19220",
        "-19695",
        "19220",
        "-19695"
    ]
]
// output
{
    "type": "keepout",
    "id": "",
    "shape": {
        "type": "polygon",
        "layer": "signal",
        "aperture_width": 0,
        "vertices": [
            [19220, -19695],
            [19220, -19695],
            [19220, -19695]
        ]
    }
}
*/
function parseKeepout(value: any[]): Keepout {
  const keepoutObj: Partial<Keepout> = { type: "keepout" }

  console.log("🚀 ~ value:", value)
  if (typeof value[0] === "string") {
    keepoutObj.id = value[0]
    value = value.slice(1)
  }
  console.log("🚀 ~ value:", value)

  value.forEach((v: any) => {
    console.log("🚀 ~ v:", v)
    const [key, ...rest] = v
    if (key === "polygon") {
      const [layer, ...vertices] = rest

      const hasApertureWidth = vertices.length % 2 !== 0
      const apertureWidth = hasApertureWidth
        ? parseFloat(vertices[0])
        : undefined
      const verticesStart = hasApertureWidth ? 1 : 0

      keepoutObj.shape = {
        type: key,
        layer,
        vertices: vertices
          .slice(verticesStart)
          .reduce((acc: [number, number][], curr: string, index: number) => {
            if (index % 2 === 0) {
              acc.push([
                parseFloat(curr),
                parseFloat(vertices[verticesStart + index + 1]),
              ])
            }
            return acc
          }, []),
      }

      if (apertureWidth !== undefined) {
        keepoutObj.shape.aperture_width = apertureWidth
      }
    } else if (key === "clearance_class") {
      keepoutObj.clearance_class = rest[0]
    }
  })

  return keepoutSchema.parse(keepoutObj)
}

function parseVia(value: any[]): Via {
  const [primary_padstack, ...spare_padstacks] = value
  return viaSchema.parse({ primary_padstack, spare_padstacks })
}

function parseRule(value: any[]): Rule {
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
    }
  })

  return ruleSchema.parse(ruleObj)
}

function parseControl(value: any[]): Control {
  const controlObj: Partial<Control> = {}

  value.forEach((v: any) => {
    const [key, val] = v
    ;(controlObj as any)[key] = parseOnOffValue(val)
  })

  return controlSchema.parse(controlObj)
}

function parseAutorouteSettings(value: any[]): AutorouteSettings {
  const settings: Partial<AutorouteSettings> = {}
  const layerRules: any[] = []

  value.forEach((v: any) => {
    const [key, ...rest] = v
    if (key === "layer_rule") {
      const [name, ...layerSettings] = rest
      const layerRule: any = { name }
      layerSettings.forEach((setting: any) => {
        const [settingKey, settingValue] = setting
        layerRule[settingKey] = isNaN(settingValue)
          ? settingValue
          : parseFloat(settingValue)
      })
      layerRules.push(layerRule)
    } else {
      ;(settings as any)[key] = isNaN(rest[0])
        ? parseOnOffValue(rest[0])
        : parseFloat(rest[0])
    }
  })

  if (layerRules.length > 0) {
    settings.layer_rule = layerRules
  }

  return autorouteSettingsSchema.parse(settings)
}
