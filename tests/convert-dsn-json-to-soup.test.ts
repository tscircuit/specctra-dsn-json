import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import {
  convertDsnJsonToSoup,
  convertDsnJsonToTscircuitSoupJson,
  parseDsnToJson,
} from "lib"

test("converts simpledsn1 DSN JSON into tscircuit soup JSON", () => {
  const rawDsn = readFileSync("./tests/simpledsn1/simpledsn1.dsn", "utf8")
  const dsnJson = parseDsnToJson(rawDsn)
  const soup = convertDsnJsonToTscircuitSoupJson(dsnJson)

  const boards = soup.filter((e) => e.type === "pcb_board")
  expect(boards).toHaveLength(1)
  expect(boards[0]).toMatchObject({
    type: "pcb_board",
    width: 10.5,
    height: 6,
    center: { x: 152.75, y: -105 },
  })

  const sourceComponents = soup.filter((e) => e.type === "source_component")
  expect(sourceComponents).toHaveLength(2)

  const pcbComponents = soup.filter((e) => e.type === "pcb_component")
  expect(pcbComponents).toHaveLength(2)

  const smtPads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(smtPads).toHaveLength(4)

  const sourceTraces = soup.filter((e) => e.type === "source_trace")
  expect(sourceTraces).toHaveLength(3)

  const pcbTraces = soup.filter((e) => e.type === "pcb_trace")
  expect(pcbTraces).toHaveLength(1)
  expect(pcbTraces[0]?.type === "pcb_trace" && pcbTraces[0].route).toHaveLength(
    2,
  )
})

test("converts complex DSN JSON with plated holes, traces, and vias into tscircuit soup JSON", () => {
  const rawDsn = readFileSync("./tests/assets/freerouting-complex1.dsn", "utf8")
  const dsnJson = parseDsnToJson(rawDsn)
  const soup = convertDsnJsonToSoup(dsnJson)

  const platedHoles = soup.filter((e) => e.type === "pcb_plated_hole")
  expect(platedHoles.length).toBeGreaterThan(0)

  const smtPads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(smtPads.length).toBeGreaterThan(0)

  const pcbTraces = soup.filter((e) => e.type === "pcb_trace")
  expect(pcbTraces.length).toBeGreaterThan(0)

  const vias = soup.filter((e) => e.type === "pcb_via")
  expect(vias.length).toBeGreaterThan(0)
})
