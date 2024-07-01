export function parseSexprStructure(elements: any[]): any {
  const parsed: any = {}

  elements.forEach((element) => {
    const key = element[0]
    const value = element.slice(1)

    switch (key) {
      case "layer":
        if (!parsed[key]) {
          parsed[key] = []
        }
        parsed[key].push(parseLayer(value))
        break
      case "boundary":
        if (!parsed[key]) {
          parsed[key] = []
        }
        parsed[key].push(parseBoundary(value[0]))
        break
      case "keepout":
        if (!parsed[key]) {
          parsed[key] = []
        }
        parsed[key].push(parseKeepout(value))
        break
      case "via":
        parsed[key] = parseVia(value)
        break
      case "rule":
        if (!parsed[key]) {
          parsed[key] = []
        }
        parsed[key].push(parseRule(value))
        break
      case "control":
        parsed[key] = parseControl(value)
        break
      case "autoroute_settings":
        parsed[key] = parseAutorouteSettings(value)
        break
      case "snap_angle":
        parsed[key] = value[0]
        break
      default:
        if (Array.isArray(value[0])) {
          if (!parsed[key]) {
            parsed[key] = []
          }
          parsed[key].push(parseSexprStructure(value))
        } else {
          parsed[key] = value.length === 1 ? value[0] : value
        }
    }
  })

  return parsed
}

function parseLayer(value: any[]): any {
  const name = value[0]
  const layerObj: any = { name }

  value.slice(1).forEach((prop) => {
    if (prop[0] === "type") {
      layerObj.type = prop[1]
    } else if (prop[0] === "property") {
      if (!layerObj.properties) {
        layerObj.properties = {}
      }
      layerObj.properties[prop[1][0]] = prop[1][1]
    }
  })

  return layerObj
}

function parseBoundary(value: any[]): any {
  const boundaryType = value[0]
  const boundaryLayer = value[1]
  const rest = value.slice(2)

  let boundaryWidth
  let coordinatesStartIndex = 0

  if (rest.length % 2 !== 0) {
    boundaryWidth = parseFloat(rest[0])
    coordinatesStartIndex = 1
  }

  const boundaryValues = rest.slice(coordinatesStartIndex)
  const coordinates: [number, number][] = []

  for (let i = 0; i < boundaryValues.length; i += 2) {
    coordinates.push([
      parseFloat(boundaryValues[i]),
      parseFloat(boundaryValues[i + 1]),
    ])
  }

  const boundaryObject: any = {
    type: boundaryType,
    layer: boundaryLayer,
    coordinates: coordinates,
  }

  if (boundaryWidth !== undefined) {
    boundaryObject.width = boundaryWidth
  }

  return boundaryObject
}

function parseKeepout(value: any[]): any {
  const keepoutObj: any = { type: "keepout" }

  if (typeof value[0] === "string") {
    keepoutObj.id = value[0]
    value = value.slice(1)
  }

  value.forEach((v: any) => {
    if (v[0] === "polygon") {
      const [type, layer, ...rest] = v
      const hasApertureWidth = rest.length % 2 !== 0
      const apertureWidth = hasApertureWidth ? parseFloat(rest[0]) : undefined
      const verticesStart = hasApertureWidth ? 1 : 0

      keepoutObj.shape = {
        type,
        layer,
        ...(apertureWidth !== undefined && { aperture_width: apertureWidth }),
        vertices: rest
          .slice(verticesStart)
          .reduce((acc: [number, number][], curr: string, index: number) => {
            if (index % 2 === 0) {
              acc.push([
                parseFloat(curr),
                parseFloat(rest[verticesStart + index + 1]),
              ])
            }
            return acc
          }, []),
      }
    } else if (v[0] === "clearance_class") {
      keepoutObj.clearance_class = v[1]
    }
  })

  return keepoutObj
}

function parseVia(value: any[]): any {
  return {
    primary_padstack: value[0],
    spare_padstacks: value.slice(1),
  }
}

function parseRule(value: any[]): any {
  const ruleObj: any = {}

  value.forEach((v: any) => {
    if (v[0] === "width") {
      ruleObj.width = parseFloat(v[1])
    } else if (v[0] === "clearance" || v[0] === "clear") {
      if (!ruleObj.clearances) {
        ruleObj.clearances = []
      }
      const clearanceObj: any = { value: parseFloat(v[1]) }
      if (v.length > 2 && v[2][0] === "type") {
        clearanceObj.type = v[2][1]
      }
      ruleObj.clearances.push(clearanceObj)
    }
  })

  return ruleObj
}

function parseControl(value: any[]): any {
  const controlObj: any = {}

  value.forEach((v: any) => {
    controlObj[v[0]] = v[1]
  })

  return controlObj
}

function parseAutorouteSettings(value: any[]): any {
  const settings: any = {}
  const layerRules: any[] = []

  value.forEach((v: any) => {
    if (v[0] === "layer_rule") {
      const layerRule: any = { name: v[1] }
      v.slice(2).forEach((setting: any) => {
        layerRule[setting[0]] = setting[1]
      })
      layerRules.push(layerRule)
    } else {
      settings[v[0]] = isNaN(v[1]) ? v[1] : parseFloat(v[1])
    }
  })

  if (layerRules.length > 0) {
    settings.layer_rules = layerRules
  }

  return settings
}
