export function parseSexprStructure(elements: any[]): any {
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

      const layerObj = parseSexprStructure(rest)
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
    } else if (key === "via") {
      const primaryPadstack = value[0]
      const sparePadstacks = value.slice(1)

      const viaObj = {
        type: "via",
        primary_padstack: primaryPadstack,
        spare_padstacks: sparePadstacks,
      }

      parsed[key] = viaObj
    } else if (key === "rule") {
      const ruleObj: any = { type: "rule" }
      const clearances: any = []

      value.forEach((v: any) => {
        if (v[0] === "width") {
          ruleObj.width = parseFloat(v[1])
        } else if (v[0] === "clearance" || v[0] === "clear") {
          const clearanceObj: any = { value: parseFloat(v[1]) }
          if (v.length > 2 && v[2][0] === "type") {
            clearanceObj.type = v[2][1]
          }
          clearances.push(clearanceObj)
        }
      })

      ruleObj.clearances = clearances
      parsed[key] = ruleObj
    } else if (Array.isArray(value[0])) {
      if (!parsed[key]) {
        parsed[key] = []
      }
      parsed[key].push(parseSexprStructure(value))
    } else {
      parsed[key] = value.length === 1 ? value[0] : value
    }
  })

  return parsed
}
