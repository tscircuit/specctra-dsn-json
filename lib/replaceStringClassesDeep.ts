export function replaceStringClassesDeep(sexpr: any[]) {
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
