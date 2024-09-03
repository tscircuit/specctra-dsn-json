import { test, expect } from "bun:test"
import { parseDsnToJson } from "lib"
import { readFileSync } from "node:fs"

test("load complex dsn file", async () => {
  const complex1 = readFileSync(
    "./tests/assets/freerouting-complex1.dsn",
    "utf8",
  )

  const json = parseDsnToJson(complex1)

  expect(true).toBe(true)
})
