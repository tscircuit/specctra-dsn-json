import { mm } from "@tscircuit/mm"

type Shape = "circle" | "rect"
type Layer = "top" | "bottom" | "all"

interface ParsedPin {
  shape: Shape
  layer: Layer
  width: number
  height: number
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

  return {
    shape: isRound ? "circle" : "rect",
    layer: layer ? layerMap[layer as InputLayer] ?? "top" : "top",
    ...(!isRound
      ? { width: mm(parsedResult.width), height: mm(parsedResult.height) }
      : {}),
    ...(parsedResult.radius !== undefined
      ? { radius: mm(parsedResult.radius) }
      : {}),
  }
}

const parseRoundPad = (rest: string): Pick<ParsedPin, "radius"> => {
  const match = rest.match(/^(\d+)_um$/)
  if (!match) throw new Error(`Invalid Round pad format: ${rest}`)
  const radius = parseFloat(match[1] ?? "0")
  return { radius }
}

const parseRectPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+)x(\d+)_um$/)
  if (!match) throw new Error(`Invalid Rect pad format: ${rest}`)
  return {
    width: parseFloat(match[1] ?? "0"),
    height: parseFloat(match[2] ?? "0"),
  }
}

const parseOvalPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+)x(\d+)_um$/)
  if (!match) throw new Error(`Invalid Oval pad format: ${rest}`)
  return {
    width: parseFloat(match[1] ?? "0"),
    height: parseFloat(match[2] ?? "0"),
  }
}

const parseRoundRectPad = (
  rest: string
): Omit<ParsedPin, "shape" | "layer"> => {
  const match = rest.match(/^(\d+)x(\d+)_(\d+(?:\.\d+)?)_um$/)
  if (!match) throw new Error(`Invalid RoundRect pad format: ${rest}`)
  return {
    width: parseFloat(match[1] ?? "0"),
    height: parseFloat(match[2] ?? "0"),
    radius: parseFloat(match[3] ?? "0"),
  }
}

const parseCustomPad = (rest: string): Omit<ParsedPin, "shape" | "layer"> => {
  // This is a placeholder for parsing custom pads
  return { width: 0, height: 0 }
}

export function extractLayerFromPinName(pinName: string): "B" | "T" | "A" {
  const layerRegex = /\[([BTA])\]/

  const match = pinName.match(layerRegex)

  if (match) {
    return match[1] as "B" | "T" | "A"
  } else {
    throw new Error(`Invalid layer in pin string: ${pinName}`)
  }
}

export const isPlatedHole = (pinName: string): boolean =>
  extractLayerFromPinName(pinName) === "A"

export const isSmtPad = (pinName: string): boolean =>
  extractLayerFromPinName(pinName) !== "A"
