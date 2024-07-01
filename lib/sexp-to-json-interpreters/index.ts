export { parseSexprParser } from "./parser"
export { parseSexprStructure } from "./structure"
export { parseSexprPlacement } from "./placement"
export { parseSexprLibrary } from "./library"
export { parseSexprNetwork } from "./network"
export { parseSexprWiring } from "./wiring"

export function parseOnOffValue<T>(value: T): boolean | T {
  if (value === "on") {
    return true
  } else if (value === "off") {
    return false
  } else {
    return value
  }
}
