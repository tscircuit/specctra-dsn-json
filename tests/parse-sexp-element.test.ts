import test from "ava"
import { parseSexpElement } from "lib/parse-sexp-element"
import { readFileSync } from "node:fs"

test("parseSexpElement parses s-expression array representation without throwing", async (t) => {
  const sampleData = JSON.parse(
    readFileSync("./tests/assets/simple2.json", "utf8")
  )

  parseSexpElement(sampleData)

  t.pass()
})
