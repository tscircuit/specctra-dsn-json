import type { AnySoupElement } from "@tscircuit/soup"
import { all_layers, layer_string, pcb_via } from "@tscircuit/soup"
import type { Structure, Via } from "lib/types"
import { viaSchema } from "lib/zod-schema"
import { z } from "zod"

type SoupPcbVia = z.infer<typeof pcb_via>

export const convertPcbStructureElementToSoup = (
  pcbStructure: Structure
): AnySoupElement[] => {
  const convertedStructureSoupElements: AnySoupElement[] = []

  Object.entries(pcbStructure).forEach(
    ([structureElementName, structureElementBody]) => {
      switch (structureElementName) {
        case "via": {
          const viaBody = viaSchema.parse(structureElementBody)
          const { hole_diameter, outer_diameter, layers } =
            transformVia(viaBody)

          convertedStructureSoupElements.push({
            type: "pcb_via",
            x: viaBody.x ?? 0,
            y: viaBody.y ?? 0,
            hole_diameter,
            outer_diameter,
            layers,
          } as SoupPcbVia)
          break
        }
        // Add more cases for other structure elements as needed
      }
    }
  )

  return convertedStructureSoupElements
}

const parseViaSize = (
  sizeString: string | undefined
): { outer: number; hole: number } => {
  const [outer, hole] = (sizeString || "0:0").split(":")
  return {
    outer: parseInt(outer || "0", 10) / 1000,
    hole: parseInt(hole || "0", 10) / 1000,
  }
}

const parseLayers = (layerString: string): z.infer<typeof layer_string>[] => {
  const matches = layerString.match(/\d+/g)
  if (!matches || matches.length < 2) {
    throw new Error(`Invalid layer string: ${layerString}`)
  }
  const [start = 0, end = 0] = matches.map(Number)
  if (!Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error(`Invalid layer indices: start=${start}, end=${end}`)
  }
  return all_layers.slice(start, end + 1)
}

const transformVia = (
  via: Via
): Pick<SoupPcbVia, "hole_diameter" | "outer_diameter" | "layers"> => {
  const { primary_padstack } = via
  const [layerString, sizeString] = primary_padstack.split("_")
  const { outer, hole } = parseViaSize(sizeString)
  const layers = layerString ? parseLayers(layerString) : []

  return {
    outer_diameter: outer,
    hole_diameter: hole,
    layers,
  }
}
