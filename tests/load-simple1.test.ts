import test from "ava"
import { parseDsnToJson } from "lib"
import { readFileSync } from "node:fs"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("load simple dsn file", async (t) => {
  const simple1 = readFileSync("./tests/assets/simple1.dsn", "utf8")

  const json = parseDsnToJson(simple1)

  t.pass()
})
