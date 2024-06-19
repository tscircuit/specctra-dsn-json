import test from "ava"
import { parseDsnToJson } from "lib"
import { convertArrayDsnToDsn } from "lib/convert-array-dsn-to-dsn"
import { readFileSync } from "node:fs"
import { getTestFixture } from "tests/fixtures/get-test-fixture"

test("load simple dsn file", async (t) => {
  const simple1 = readFileSync("./tests/assets/simple1.json", "utf8")
  const simple1Dsn = convertArrayDsnToDsn(JSON.parse(simple1))

  const json = parseDsnToJson(simple1Dsn)

  t.pass()
})
