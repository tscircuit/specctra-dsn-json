import { expect, test } from "bun:test"
import { parseDsnToJson } from "../lib"
import { parseSexprKeepout } from "../lib/sexp-to-json-interpreters/keepout"
import { parseSexprLibrary } from "../lib/sexp-to-json-interpreters/library"
import { parseSexprShape } from "../lib/sexp-to-json-interpreters/shape"
import { parseSexprWiring } from "../lib/sexp-to-json-interpreters/wiring"

const QARC_SEXP = ["qarc", "F.Cu", "0.2", "10", "0", "0", "10", "0", "0"]

test("parses Specctra qarc instead of throwing Invalid shape type", () => {
  expect(parseSexprShape(QARC_SEXP)).toEqual({
    type: "qarc",
    layer: "F.Cu",
    aperture_width: 0.2,
    start: [10, 0],
    end: [0, 10],
    center: [0, 0],
  })
})

test("parses qarc keepouts, padstacks, and wires", () => {
  const keepout = parseSexprKeepout(["ARC1", QARC_SEXP])
  expect(keepout.id).toBe("ARC1")
  expect(keepout.shape).toMatchObject({ type: "qarc", center: [0, 0] })

  const library = parseSexprLibrary([
    ["padstack", "QarcPad", ["shape", QARC_SEXP]],
  ])
  expect(library[0]).toMatchObject({
    padstack: {
      name: "QarcPad",
      shapes: [{ type: "qarc", start: [10, 0], end: [0, 10] }],
    },
  })

  const wiring = parseSexprWiring([
    ["wire", QARC_SEXP, ["net", "NET1"], ["type", "route"]],
  ])
  const wire = wiring.wires[0]
  expect(wire?.net).toBe("NET1")
  expect(wire?.shape.type).toBe("qarc")
})

test("parseDsnToJson accepts a KiCad-style qarc keepout and wire", () => {
  const json = parseDsnToJson(`(pcb qarc-test
    (parser (host_cad KiCad))
    (resolution um 10)
    (unit um)
    (structure
      (layer F.Cu (type signal))
      (boundary (path pcb 0 0 0 10 0 10 10 0 10))
      (keepout "" (qarc F.Cu 0.2 10 0 0 10 0 0))
      (via Via)
      (rule (width 0.15))
    )
    (placement)
    (library
      (padstack Via (shape (circle F.Cu 0.4 0 0)))
    )
    (network)
    (wiring
      (wire (qarc F.Cu 0.15 10 0 0 10 0 0) (net NET1) (type route))
    )
  )`)

  expect(json.structure.keepouts?.[0]?.shape).toEqual({
    type: "qarc",
    layer: "F.Cu",
    aperture_width: 0.2,
    start: [10, 0],
    end: [0, 10],
    center: [0, 0],
  })
  expect(json.wiring.wires[0]?.shape).toMatchObject({
    type: "qarc",
    aperture_width: 0.15,
    center: [0, 0],
  })
})
