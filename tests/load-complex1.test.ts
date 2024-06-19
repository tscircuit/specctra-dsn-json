import test from "ava"
import { parseDsnToJson } from "lib"
import { readFileSync } from "node:fs"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("load complex dsn file", async (t) => {
  const complex1 = readFileSync(
    "./tests/assets/freerouting-complex1.dsn",
    "utf8"
  )

  const json = parseDsnToJson(complex1)

  t.pass()
})
