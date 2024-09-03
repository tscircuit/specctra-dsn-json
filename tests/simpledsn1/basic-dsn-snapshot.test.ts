import { test, expect } from "bun:test"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
// @ts-ignore
import simpledsn1 from "./simpledsn1.dsn" with { "type": "text" }
import { parseDsnToJson } from "lib"
import { writeFileSync } from "node:fs"
import type { DsnPcbDesign } from "lib/types"
import type { PCBSMTPad } from "@tscircuit/soup"
import { logSoup } from "@tscircuit/log-soup"

function convertDsnJsonToTscircuitSoupJson(dsnJson: DsnPcbDesign): Array<{
  x: number
  y: number
  type: "pcb_smtpad"
  layer: "top" | "bottom"
  shape: "rect"
  pcb_smtpad_id: string
  width: number // in mm
  height: number // in mm
}> {
  const soupElements: Array<PCBSMTPad> = []

  dsnJson.placement.forEach((component) => {
    component.places.forEach((place) => {
      const image = dsnJson.library.find(
        (lib) => "image" in lib && lib.image.name === component.component,
      )
      if (image && "image" in image) {
        image.image.pins.forEach((pin, index) => {
          const padstack = dsnJson.library.find(
            (lib) => "padstack" in lib && lib.padstack.name === pin.name,
          )
          if (padstack && "padstack" in padstack) {
            const shape = padstack.padstack.shapes[0]!
            if (shape.type === "polygon") {
              const xCoords = shape.coordinates.map((coord) => coord[0])
              const yCoords = shape.coordinates.map((coord) => coord[1])
              const width = Math.max(...xCoords) - Math.min(...xCoords)
              const height = Math.max(...yCoords) - Math.min(...yCoords)

              const pcbSmtpad: PCBSMTPad = {
                x: (place.x + pin.x) / 1000, //um -> mm
                y: (place.y + pin.y) / 1000, //um -> mm
                type: "pcb_smtpad",
                layer: place.side === "front" ? "top" : "bottom",
                shape: "rect",
                pcb_smtpad_id: `${place.component_id}-${index + 1}`,
                width: width / 1000, // Convert um to mm
                height: height / 1000, // Convert um to mm
              }

              soupElements.push(pcbSmtpad)
            }
          }
        })
      }
    })
  })

  return soupElements
}

test("generate soup and match SVG snapshot", async () => {
  const dsnJson = parseDsnToJson(simpledsn1)

  // writeFileSync("simpledsn1.json", JSON.stringify(dsnJson, null, 2))

  const soupElements = convertDsnJsonToTscircuitSoupJson(dsnJson)

  await logSoup("simpledsn1", soupElements)

  const svg = circuitJsonToPcbSvg(soupElements as any)
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
