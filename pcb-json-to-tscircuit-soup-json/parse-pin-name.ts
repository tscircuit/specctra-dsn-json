import { mm } from "@tscircuit/mm"

type Shape = "circle" | "rect" | "oval"
type Layer = "top" | "bottom" | "all"

export interface ParsedPin {
  shape: Shape
  layer: Layer
  width?: number
  height?: number
  radius?: number
}

const layerMap = {
  A: "all",
  T: "top",
  B: "bottom",
} as const

type InputLayer = keyof typeof layerMap

export const parsePinName = (name: string): ParsedPin => {
  const baseRegex = /^(?<shape>\w+)\[(?<layer>[ATB])\]Pad_(?<rest>.+)$/
  const match = name.match(baseRegex)

  if (!match || !match.groups) {
    throw new Error(`Invalid pad string format: ${name}`)
  }

  const { shape, layer, rest = "" } = match.groups

  const parsers = {
    Round: parseRoundPad,
    Rect: parseRectPad,
    Oval: parseOvalPad,
    RoundRect: parseRoundRectPad,
    Cust: parseCustomPad,
  }

  if (!shape) {
    throw new Error(`Failed to parse shape of pin: ${name}`)
  }

  const parser = parsers[shape as keyof typeof parsers]
  if (!parser) {
    throw new Error(`Unknown pad shape: ${shape}`)
  }

  const parsedResult = parser(rest)
  const isRound = shape === "Round"
  const isOval = shape === "Oval"

  return {
    shape: isRound ? "circle" : isOval ? "oval" : "rect",
    layer: layer ? (layerMap[layer as InputLayer] ?? "top") : "top",
    ...(!isRound &&
    parsedResult.width !== undefined &&
    parsedResult.height !== undefined
      ? {
          width: mm(`${parsedResult.width}um`),
          height: mm(`${parsedResult.height}um`),
        }
      : {}),
    ...(parsedResult.radius !== undefined
      ? { radius: mm(`${parsedResult.radius}um`) }
      : {}),
  }
}

const parseRoundPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+(?:\.\d+)?)_um(?:_.*)?$/)
  if (!match) throw new Error(`Invalid Round pad format: ${rest}`)
  const diameter = Number.parseFloat(match[1] ?? "0")
  return { radius: diameter / 2 }
}

const parseRectPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)_um(?:_.*)?$/)
  if (!match) throw new Error(`Invalid Rect pad format: ${rest}`)
  return {
    width: Number.parseFloat(match[1] ?? "0"),
    height: Number.parseFloat(match[2] ?? "0"),
  }
}

const parseOvalPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)_um(?:_.*)?$/)
  if (!match) throw new Error(`Invalid Oval pad format: ${rest}`)
  return {
    width: Number.parseFloat(match[1] ?? "0"),
    height: Number.parseFloat(match[2] ?? "0"),
  }
}

const parseRoundRectPad = (
  rest: string,
): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(
    /^(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)_(\d+(?:\.\d+)?)_um(?:_.*)?$/,
  )
  if (!match) throw new Error(`Invalid RoundRect pad format: ${rest}`)
  return {
    width: Number.parseFloat(match[1] ?? "0"),
    height: Number.parseFloat(match[2] ?? "0"),
    radius: Number.parseFloat(match[3] ?? "0"),
  }
}

const parseCustomPad = (_rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  return { width: 0, height: 0 }
}

export function extractLayerFromPinName(pinName: string): "B" | "T" | "A" {
  const layerRegex = /\[([BTA])\]/

  const match = pinName.match(layerRegex)

  if (match) {
    return match[1] as "B" | "T" | "A"
  }
  throw new Error(`Invalid layer in pin string: ${pinName}`)
}

export const isPlatedHole = (pinName: string): boolean =>
  extractLayerFromPinName(pinName) === "A"

export const isSmtPad = (pinName: string): boolean =>
  extractLayerFromPinName(pinName) !== "A"

