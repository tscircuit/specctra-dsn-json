import { test, expect } from "bun:test"
import { circuitJsonToPcbSvg } from "circuit-to-svg"

test("generate soup and match SVG snapshot", () => {
  const soupElements: any[] = [
    {
      type: "source_component",
      source_component_id: "source_component_1",
      name: "R1",
      ftype: "resistor",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_component_1",
      source_component_id: "source_component_1",
      name: "R1",
      ftype: "resistor",
      width: 2.54,
      height: 10.16,
      rotation: 0,
      center: { x: 0, y: 0 },
      layer: "top",
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pcb_smtpad_1",
      pcb_component_id: "pcb_component_1",
      width: 1.27,
      height: 1.27,
      center: { x: 0, y: 0 },
      layer: "top",
    },
  ]

  const svg = circuitJsonToPcbSvg(soupElements)
  expect(svg).toMatchSvgSnapshot(import.meta.path)
})
