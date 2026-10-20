import { test, expect } from "bun:test"
import { parseDsnToJson } from "lib"
import { convertArrayDsnToDsn } from "lib/convert-array-dsn-to-dsn"
import { readFileSync } from "node:fs"

test("load simple dsn file", async () => {
  const simple1 = readFileSync("./tests/assets/simple1.json", "utf8")
  const simple1Dsn = convertArrayDsnToDsn(JSON.parse(simple1))

  const json = parseDsnToJson(simple1Dsn)

  expect(json.pcb_id).toBeTruthy()
  expect(json.parser.host_cad).toBe("KiCad's Pcbnew")
  expect(json.resolution.unit).toBe("um")
  expect(json.structure.layers.length).toBeGreaterThan(0)
  expect(json.placement.length).toBeGreaterThan(0)
  expect(json.library.length).toBeGreaterThan(0)
  expect(json.network.nets?.length).toBeGreaterThan(0)
  expect(json.wiring.wires.length).toBeGreaterThan(0)
})
