import type { Circle, Shape } from "lib/types"

export const SHAPE_NAMES = new Set([
  "rect",
  "circle",
  "polygon",
  "path",
] as const)

export function parseShape(data: any[]): Shape {
  const [shapeType, layer, ...shapeData] = data

  switch (shapeType) {
    case "circle":
      const circleShape: Circle = {
        type: "circle",
        layer,
        radius: parseFloat(shapeData[0]),
      }
      if (shapeData.length >= 3) {
        circleShape.x = parseFloat(shapeData[1])
        circleShape.y = parseFloat(shapeData[2])
      }
      return circleShape
    case "rect":
      return {
        type: "rect",
        layer,
        coordinates: [
          [parseFloat(shapeData[0]), parseFloat(shapeData[1])],
          [parseFloat(shapeData[2]), parseFloat(shapeData[3])],
        ],
      }
    case "path":
      return {
        type: "path",
        layer,
        width: parseFloat(shapeData[0]),
        coordinates: parseCoordinates(shapeData.slice(1)),
      }
    case "polygon":
      const hasApertureWidth = shapeData.length % 2 !== 0
      const apertureWidth = hasApertureWidth
        ? parseFloat(shapeData[0])
        : undefined
      const coordinatesStart = hasApertureWidth ? 1 : 0

      return {
        type: "polygon",
        layer,
        coordinates: parseCoordinates(shapeData.slice(coordinatesStart)),
        ...(apertureWidth !== undefined && { aperture_width: apertureWidth }),
      }
    default:
      console.warn(`Unexpected shape type: ${shapeType}`)
      throw new Error(`Invalid shape type: ${shapeType}`)
  }
}

function parseCoordinates(data: string[]): [number, number][] {
  return data.reduce((acc: [number, number][], curr: string, index: number) => {
    if (index % 2 === 0) {
      const nextValue = data[index + 1]
      if (curr !== undefined && nextValue !== undefined) {
        acc.push([parseFloat(curr), parseFloat(nextValue)])
      }
    }
    return acc
  }, [])
}
