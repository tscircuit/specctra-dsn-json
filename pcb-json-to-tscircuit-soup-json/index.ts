import type { PcbDesign, Structure } from "lib/types"
import * as Soup from "@tscircuit/soup"
import type { AnySoupElement } from "@tscircuit/soup"
import { convertPcbStructureElementToSoup } from "./pcb-element-to-soup-converters/pcb-structure"

export const convertPcbJsonToTscircuitSoupJson = (pcb: PcbDesign) => {
  const soupElements: AnySoupElement[] = []

  // Add source component
  const source_component = Soup.any_source_component.parse({
    type: "source_component",
    source_component_id: "source_component_1",
    name: "U1",
    ftype: "simple_bug",
  })

  const pcb_component = Soup.pcb_component.parse({
    type: "pcb_component",
    pcb_component_id: "pcb_component_1",
    source_component_id: "source_component_1",
    name: "U1",
    ftype: "simple_bug",
    width: 0,
    height: 0,
    rotation: 0,
    center: { x: 0, y: 0 },
    layer: "top",
  } as Soup.PCBComponentInput)

  soupElements.push(source_component, pcb_component)

  for (const [pcb_element_name, pcb_element_body] of Object.entries(pcb)) {
    switch (pcb_element_name) {
      case "structure":
        soupElements.push(
          ...convertPcbStructureElementToSoup(pcb_element_body as Structure)
        )
        break
      // add more cases here
    }
  }

  return soupElements
}
