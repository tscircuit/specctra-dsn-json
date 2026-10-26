import type { PathShape, DsnPcbDesign, Image, Padstack } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { mm } from "@tscircuit/mm"
import { isPlatedHole, isSmtPad, parsePinName } from "./parse-pin-name"

function toMm(val: number, unit = "um"): number {
  const u = unit.toLowerCase()
  if (u === "mm") return val
  if (u === "um") return val / 1000
  if (u === "mil") return val * 0.0254
  if (u === "in" || u === "inch") return val * 25.4
  return mm(`${val}${u}`)
}

function mapLayerName(
  layerName: string,
):
  | "top"
  | "bottom"
  | "inner1"
  | "inner2"
  | "inner3"
  | "inner4"
  | "inner5"
  | "inner6" {
  const normalized = layerName.trim()
  if (normalized === "F.Cu" || normalized === "top" || normalized === "front") {
    return "top"
  }
  if (
    normalized === "B.Cu" ||
    normalized === "bottom" ||
    normalized === "back"
  ) {
    return "bottom"
  }
  const innerMatch = normalized.match(/^In(\d+)\.Cu$/i)
  if (innerMatch) {
    const idx = Number.parseInt(innerMatch[1] ?? "1", 10)
    if (idx >= 1 && idx <= 6) {
      return `inner${idx}` as "inner1"
    }
  }
  return "top"
}

function parseViaDimensionsFromPadstack(
  padstackName: string,
  padstack: Padstack | undefined,
  unit: string,
): { outer_diameter: number; hole_diameter: number } {
  const viaMatch = padstackName.match(
    /Via\[[^\]]+\]_(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)_um/,
  )
  if (viaMatch) {
    const outerUm = Number.parseFloat(viaMatch[1] ?? "600")
    const holeUm = Number.parseFloat(viaMatch[2] ?? "300")
    return {
      outer_diameter: outerUm / 1000,
      hole_diameter: holeUm / 1000,
    }
  }
  if (padstack) {
    const circleShape = padstack.shapes.find((s) => s.type === "circle")
    if (circleShape && circleShape.type === "circle") {
      const outer = toMm(circleShape.radius, unit)
      return {
        outer_diameter: outer,
        hole_diameter: outer * 0.5,
      }
    }
  }
  return { outer_diameter: 0.6, hole_diameter: 0.3 }
}

export const convertDsnJsonToTscircuitSoupJson = (
  pcb: DsnPcbDesign,
): AnySoupElement[] => {
  const soupElements: AnySoupElement[] = []
  const unit = pcb.unit || pcb.resolution?.unit || "um"

  // 1. Convert board boundary to pcb_board
  const boundaryCoords = (pcb.structure?.boundaries ?? []).flatMap((b) =>
    "coordinates" in b ? b.coordinates : [],
  )
  if (boundaryCoords.length > 0) {
    const xs = boundaryCoords.map((c) => toMm(c[0], unit))
    const ys = boundaryCoords.map((c) => toMm(c[1], unit))
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    soupElements.push(
      Soup.pcb_board.parse({
        type: "pcb_board",
        width: maxX - minX,
        height: maxY - minY,
        center: {
          x: (minX + maxX) / 2,
          y: (minY + maxY) / 2,
        },
      }),
    )
  }

  const pinKeyToSourcePortId = new Map<string, string>()
  const pinKeyToPcbPortId = new Map<string, string>()

  // 2. Convert placed components and pins
  const pcbComponents = pcb.placement.flatMap((component) =>
    component.places.map((place) => ({
      componentName: component.component,
      place,
    })),
  )

  for (const [index, { componentName, place }] of pcbComponents.entries()) {
    const { component_id, x, y, side, rotation } = place
    const soupSourceComponentId = index + 1
    const componentFunctionalType = "simple_bug"
    const soupSourceComponent = Soup.any_source_component.parse({
      type: "source_component",
      source_component_id: `source_component_${soupSourceComponentId}`,
      name: component_id,
      ftype: componentFunctionalType,
    })

    const pcbImages = pcb.library.filter(
      (el): el is { image: Image } => "image" in el,
    )
    const pcbComponentImage = pcbImages.find(
      (el) => el.image.name === componentName,
    )?.image
    if (!pcbComponentImage) {
      throw new Error(`PCB component image not found: ${componentName}`)
    }

    const pcbComponentOutlines = pcbComponentImage.outlines.filter((el) =>
      el.type.includes("path"),
    ) as PathShape[]
    const pcbComponentDimensions = calculatePcbComponentDimensions(
      pcbComponentOutlines,
      unit,
    ) ?? { width: 0, height: 0 }

    const centerX = toMm(x, unit)
    const centerY = toMm(y, unit)
    const componentLayer = side === "front" ? "top" : "bottom"

    const soupPcbComponent = Soup.pcb_component.parse({
      type: "pcb_component",
      pcb_component_id: `pcb_component_${soupSourceComponentId}`,
      source_component_id: `source_component_${soupSourceComponentId}`,
      width: pcbComponentDimensions.width,
      height: pcbComponentDimensions.height,
      rotation,
      center: { x: centerX, y: centerY },
      layer: componentLayer,
    })

    soupElements.push(soupSourceComponent, soupPcbComponent)

    const sortedPins = [...pcbComponentImage.pins].sort(
      (a, b) => Number(a.pin_number) - Number(b.pin_number),
    )

    const rad = ((rotation ?? 0) * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)

    for (const pin of sortedPins) {
      const { pin_number, name } = pin
      const localX = side === "back" ? -pin.x : pin.x
      const localY = pin.y
      const rotX = localX * cos - localY * sin
      const rotY = localX * sin + localY * cos
      const pinX = toMm(x + rotX, unit)
      const pinY = toMm(y + rotY, unit)

      const sourcePortId = `source_port_${component_id}_${pin_number}`
      const pcbPortId = `pcb_port_${component_id}_${pin_number}`
      pinKeyToSourcePortId.set(`${component_id}-${pin_number}`, sourcePortId)
      pinKeyToPcbPortId.set(`${component_id}-${pin_number}`, pcbPortId)

      const soupSourcePort = Soup.source_port.parse({
        type: "source_port",
        source_port_id: sourcePortId,
        source_component_id: soupSourceComponent.source_component_id,
        name: pin_number,
        pin_number: Number.isNaN(Number(pin_number))
          ? undefined
          : Number(pin_number),
        port_hints: [pin_number],
      })

      let parsedPin = (() => {
        try {
          return parsePinName(name)
        } catch {
          return undefined
        }
      })()

      if (
        !parsedPin ||
        ((parsedPin.width === 0 || parsedPin.width === undefined) &&
          parsedPin.radius === undefined)
      ) {
        const padstackEntry = pcb.library.find(
          (el): el is { padstack: Padstack } =>
            "padstack" in el && el.padstack.name === name,
        )
        const firstShape = padstackEntry?.padstack.shapes[0]
        if (firstShape) {
          if (firstShape.type === "circle") {
            parsedPin = {
              shape: "circle",
              layer:
                padstackEntry.padstack.shapes.length > 1
                  ? "all"
                  : mapLayerName(firstShape.layer) === "bottom"
                    ? "bottom"
                    : "top",
              radius: toMm(firstShape.radius, unit) / 2,
            }
          } else if ("coordinates" in firstShape) {
            const xs = firstShape.coordinates.map((c) => c[0])
            const ys = firstShape.coordinates.map((c) => c[1])
            parsedPin = {
              shape: "rect",
              layer:
                padstackEntry.padstack.shapes.length > 1
                  ? "all"
                  : mapLayerName(firstShape.layer) === "bottom"
                    ? "bottom"
                    : "top",
              width: toMm(Math.max(...xs) - Math.min(...xs), unit),
              height: toMm(Math.max(...ys) - Math.min(...ys), unit),
            }
          }
        }
      }

      if (!parsedPin) continue

      const isThroughHole = (() => {
        try {
          return isPlatedHole(name)
        } catch {
          return parsedPin.layer === "all"
        }
      })()

      const padLayer: "top" | "bottom" =
        side === "back"
          ? parsedPin.layer === "bottom"
            ? "top"
            : "bottom"
          : parsedPin.layer === "bottom"
            ? "bottom"
            : "top"

      const soupPcbPort = Soup.pcb_port.parse({
        type: "pcb_port",
        pcb_port_id: pcbPortId,
        source_port_id: sourcePortId,
        pcb_component_id: soupPcbComponent.pcb_component_id,
        x: pinX,
        y: pinY,
        layers: isThroughHole ? ["top", "bottom"] : [padLayer],
      })

      soupElements.push(soupSourcePort, soupPcbPort)

      if (!isThroughHole && isSmtPadFromParsed(name, parsedPin)) {
        if (parsedPin.shape === "circle") {
          const soupPcbPin = Soup.pcb_smtpad.parse({
            pcb_smtpad_id: `pcb_smtpad_${component_id}_${pin_number}`,
            pcb_component_id: soupPcbComponent.pcb_component_id,
            pcb_port_id: pcbPortId,
            type: "pcb_smtpad",
            x: pinX,
            y: pinY,
            shape: "circle",
            layer: padLayer,
            radius: parsedPin.radius ?? 0.5,
            port_hints: [pin_number],
          })
          soupElements.push(soupPcbPin)
        } else {
          const soupPcbPin = Soup.pcb_smtpad.parse({
            pcb_smtpad_id: `pcb_smtpad_${component_id}_${pin_number}`,
            pcb_component_id: soupPcbComponent.pcb_component_id,
            pcb_port_id: pcbPortId,
            type: "pcb_smtpad",
            x: pinX,
            y: pinY,
            shape: "rect",
            layer: padLayer,
            width: parsedPin.width ?? 1,
            height: parsedPin.height ?? 1,
            port_hints: [pin_number],
          })
          soupElements.push(soupPcbPin)
        }
      } else {
        if (parsedPin.shape === "circle") {
          const outerDiameter = (parsedPin.radius ?? 0.75) * 2
          const holeDiameter = Number((outerDiameter * 0.6).toFixed(4))
          const soupPlatedHole = Soup.pcb_plated_hole.parse({
            type: "pcb_plated_hole",
            shape: "circle",
            x: pinX,
            y: pinY,
            outer_diameter: outerDiameter,
            hole_diameter: holeDiameter,
            layers: ["top", "bottom"],
            pcb_component_id: soupPcbComponent.pcb_component_id,
            pcb_port_id: pcbPortId,
            port_hints: [pin_number],
          })
          soupElements.push(soupPlatedHole)
        } else {
          const outerWidth = parsedPin.width ?? 1.5
          const outerHeight = parsedPin.height ?? 1.5
          const soupPlatedHole = Soup.pcb_plated_hole.parse({
            type: "pcb_plated_hole",
            shape: "oval",
            x: pinX,
            y: pinY,
            outer_width: outerWidth,
            outer_height: outerHeight,
            hole_width: Number((outerWidth * 0.6).toFixed(4)),
            hole_height: Number((outerHeight * 0.6).toFixed(4)),
            layers: ["top", "bottom"],
            pcb_component_id: soupPcbComponent.pcb_component_id,
            pcb_port_id: pcbPortId,
            port_hints: [pin_number],
          })
          soupElements.push(soupPlatedHole)
        }
      }
    }
  }

  // 3. Convert network nets into source_trace elements
  const netToSourceTraceId = new Map<string, string>()
  for (const [index, net] of (pcb.network?.nets ?? []).entries()) {
    const pinRefs = Array.isArray(net.pins) ? net.pins : [net.pins]
    const connectedSourcePortIds = pinRefs
      .map((pinRef) => pinKeyToSourcePortId.get(pinRef))
      .filter((id): id is string => Boolean(id))
    const sourceTraceId = `source_trace_${index + 1}`
    netToSourceTraceId.set(net.name, sourceTraceId)
    soupElements.push(
      Soup.any_soup_element.parse({
        type: "source_trace",
        source_trace_id: sourceTraceId,
        connected_source_port_ids: connectedSourcePortIds,
        connected_source_net_ids: [],
      }),
    )
  }

  // 4. Convert wiring wires into pcb_trace elements
  for (const [index, wire] of (pcb.wiring?.wires ?? []).entries()) {
    if ("coordinates" in wire.shape && wire.shape.coordinates.length >= 2) {
      const layer = mapLayerName(wire.shape.layer)
      const width =
        "width" in wire.shape
          ? toMm(wire.shape.width, unit)
          : toMm(wire.shape.aperture_width ?? 200, unit)
      const route = wire.shape.coordinates.map(([wx, wy]) => ({
        route_type: "wire" as const,
        x: toMm(wx, unit),
        y: toMm(wy, unit),
        width: width > 0 ? width : 0.2,
        layer,
      }))
      const sourceTraceId = netToSourceTraceId.get(wire.net)
      soupElements.push(
        Soup.pcb_trace.parse({
          type: "pcb_trace",
          pcb_trace_id: `pcb_trace_${index + 1}`,
          ...(sourceTraceId ? { source_trace_id: sourceTraceId } : {}),
          route,
        }),
      )
    }
  }

  // 5. Convert vias into pcb_via elements
  const allVias = [...(pcb.wiring?.vias ?? []), ...(pcb.network?.vias ?? [])]
  for (const via of allVias) {
    if (via.x === undefined || via.y === undefined) continue
    const padstackEntry = pcb.library.find(
      (el): el is { padstack: Padstack } =>
        "padstack" in el && el.padstack.name === via.primary_padstack,
    )
    const { outer_diameter, hole_diameter } = parseViaDimensionsFromPadstack(
      via.primary_padstack,
      padstackEntry?.padstack,
      unit,
    )
    soupElements.push(
      Soup.pcb_via.parse({
        type: "pcb_via",
        x: toMm(via.x, unit),
        y: toMm(via.y, unit),
        outer_diameter,
        hole_diameter,
        from_layer: "top",
        to_layer: "bottom",
        layers: ["top", "bottom"],
      }),
    )
  }

  return soupElements
}

function isSmtPadFromParsed(
  pinName: string,
  parsedPin: { layer: "top" | "bottom" | "all" },
): boolean {
  try {
    return isSmtPad(pinName)
  } catch {
    return parsedPin.layer !== "all"
  }
}

function calculatePcbComponentDimensions(
  outlines: PathShape[],
  unit = "um",
): { width: number; height: number } | undefined {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY

  if (!outlines.length || (outlines[0] && !("coordinates" in outlines[0]))) {
    return undefined
  }

  for (const outline of outlines) {
    for (const [x, y] of outline.coordinates) {
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
  }

  const width = maxX - minX
  const height = maxY - minY

  return { width: toMm(width, unit), height: toMm(height, unit) }
}

export const convertDsnJsonToSoup = convertDsnJsonToTscircuitSoupJson
export const convertPcbJsonToTscircuitSoupJson =
  convertDsnJsonToTscircuitSoupJson
export const convertDsnJsonToCircuitJson = convertDsnJsonToTscircuitSoupJson

