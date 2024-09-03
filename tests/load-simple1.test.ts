import { test, expect } from "bun:test"
import { parseDsnToJson } from "lib"
import { convertArrayDsnToDsn } from "lib/convert-array-dsn-to-dsn"
import { readFileSync } from "node:fs"

test.skip("load simple dsn file", async (t) => {
  const simple1 = readFileSync("./tests/assets/simple1.json", "utf8")
  const simple1Dsn = convertArrayDsnToDsn(JSON.parse(simple1))

  const json = parseDsnToJson(simple1Dsn)

  expect(true).toBe(true)
})
