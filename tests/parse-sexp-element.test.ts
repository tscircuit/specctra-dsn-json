import { test, expect } from "bun:test"
import { parseSexpElements } from "../lib/parse-sexp-element"
import { readFileSync } from "node:fs"

test("parseSexpElement parses s-expression array representation without throwing", () => {
  const sampleData = JSON.parse(
    readFileSync("./tests/assets/simple2.json", "utf8"),
  )

  const result = parseSexpElements(sampleData)

  expect(result).toBeTruthy()
  expect(typeof result.pcb_id).toBe("string")
  expect(result.parser).toBeTruthy()
  expect(result.parser.constant).toEqual({ pcb_xlo: "-57.1000" })
  expect(result.resolution).toBeTruthy()
  expect(result.unit).toBeTruthy()
  expect(result.structure).toBeTruthy()
  expect(result.placement).toBeTruthy()
  expect(result.library).toBeTruthy()
  expect(result.network).toBeTruthy()
  expect(result.wiring).toEqual({ wires: [], vias: [] })
})
