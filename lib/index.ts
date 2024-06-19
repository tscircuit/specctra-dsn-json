import parseSExpression from "s-expression"

export const parseDsnToJson = (dsn: string) => {
  // Many files feature a line that breaks the s-expression parser
  // that looks like this: `(string_quote ")`, the unterminated quote
  // confuses the parser. To avoid this we just remove it.

  dsn = dsn.replace(`(string_quote ")`, ``)

  const sexpr = parseSExpression(dsn)

  // recursively replace String class instances with regular strings
  replaceStringClassesDeep(sexpr)

  console.log(sexpr)
}

function replaceStringClassesDeep(sexpr: any[]) {
  for (let i = 0; i < sexpr.length; i++) {
    const item = sexpr[i]
    if (item instanceof String) {
      sexpr[i] = item.toString()
    } else if (Array.isArray(item)) {
      replaceStringClassesDeep(item)
    }
  }
  return sexpr
}
