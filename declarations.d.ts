declare module "s-expression" {
  const anyModule: any
  export = anyModule
}

declare module "bun-match-svg" {}

declare module "bun:test" {
  interface Matchers<T = unknown> {
    toMatchSvgSnapshot(
      testPath: string,
      svgName?: string,
    ): Promise<MatcherResult>
    toMatchMultipleSvgSnapshots(
      testPath: string,
      svgNames?: string[],
    ): Promise<MatcherResult>
  }
}
