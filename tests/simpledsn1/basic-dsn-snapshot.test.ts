import { test, expect } from "bun:test"
import { circuitJsonToPcbSvg } from "circuit-to-svg"
// @ts-ignore
import simpledsn1 from "./simpledsn1.dsn" with { "type": "text" }
import { parseDsnToJson } from "lib"
import { writeFileSync } from "node:fs"
import type { DsnPcbDesign } from "lib/types"
import type { PCBSMTPad } from "@tscircuit/soup"

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
  return []
}

test("generate soup and match SVG snapshot", () => {
  const dsnJson = parseDsnToJson(simpledsn1)

  // writeFileSync("simpledsn1.json", JSON.stringify(dsnJson, null, 2))

  const soupElements = convertDsnJsonToTscircuitSoupJson(dsnJson)

  const svg = circuitJsonToPcbSvg(soupElements as any)
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
