import test from "ava"
import { parseSexpElement } from "../lib/parse-sexp-element"
import { readFileSync } from "node:fs"

test("parseSexpElement parses s-expression array representation without throwing", (t) => {
  const sampleData = JSON.parse(
    readFileSync("./tests/assets/simple2.json", "utf8")
  )

  const result = parseSexpElement(sampleData)

  t.truthy(result)
  t.is(typeof result.pcb_id, "string")
  t.truthy(result.parser)
  t.truthy(result.resolution)
  t.truthy(result.unit)
  t.truthy(result.structure)
})
