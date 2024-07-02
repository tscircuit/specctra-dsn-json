import { z } from "zod"

// Parser schema
export const parserSchema = z.object({
  space_in_quoted_tokens: z.boolean().optional(),
  host_cad: z.string().optional(),
  host_version: z.string().optional(),
  constant: z.record(z.string(), z.string()).optional(),
  write_resolution: z.array(z.tuple([z.string(), z.number()])).optional(),
  routes_include: z
    .array(z.enum(["testpoint", "guides", "image_conductor"]))
    .optional(),
  wires_include: z.string().optional(),
  case_sensitive: z.boolean().optional(),
  rotate_first: z.boolean().optional(),
  generated_by_freeroute: z.boolean().optional(),
})

// Resolution schema
export const resolutionSchema = z.object({
  unit: z.string(),
  value: z.number(),
})

// Layer schema
export const layerSchema = z.object({
  name: z.string(),
  type: z.string(),
  properties: z
    .record(z.string(), z.union([z.string(), z.number()]))
    .optional(),
  direction: z.enum(["horizontal", "vertical"]).optional(),
  cost: z.number().optional(),
})

// Boundary schema
export const boundarySchema = z.object({
  type: z.enum(["path", "rect", "circle"]),
  layer: z.string(),
  width: z.number().optional(),
  coordinates: z.array(z.tuple([z.number(), z.number()])),
})

// Keepout schema
export const keepoutSchema = z.object({
  type: z.literal("keepout"),
  id: z.string().optional(),
  shape: z.object({
    type: z.enum(["polygon", "rect", "circle"]),
    layer: z.string(),
    aperture_width: z.number().optional(),
    vertices: z.array(z.tuple([z.number(), z.number()])),
  }),
  clearance_class: z.string().optional(),
})

// Via schema
export const viaSchema = z.object({
  primary_padstack: z.string(),
  spare_padstacks: z.array(z.string()),
})

// Rule schema
export const ruleSchema = z.object({
  name: z.string().optional(),
  width: z.number().optional(),
  clearances: z
    .array(
      z.object({
        value: z.number(),
        type: z.string().optional(),
      })
    )
    .optional(),
  length: z
    .object({
      min: z.number(),
      max: z.number(),
    })
    .optional(),
  via_costs: z.number().optional(),
  layer_change_costs: z.number().optional(),
})

// Control schema
export const controlSchema = z.object({
  via_at_smd: z.boolean().optional(),
  off_grid_wires: z.boolean().optional(),
  ignore_conduction: z.boolean().optional(),
  fanout_direction: z.enum(["clockwise", "counterclockwise"]).optional(),
})

// Autoroute settings schema
export const autorouteSettingsSchema = z.object({
  fanout: z.union([z.string(), z.boolean()]),
  autoroute: z.union([z.string(), z.boolean()]),
  postroute: z.union([z.string(), z.boolean()]),
  vias: z.union([z.string(), z.boolean()]),
  via_costs: z.number(),
  plane_via_costs: z.number(),
  start_ripup_costs: z.number(),
  start_pass_no: z.number(),
  layer_rule: z.array(
    z.object({
      name: z.string(),
      active: z.union([z.string(), z.boolean()]),
      preferred_direction: z.enum(["horizontal", "vertical"]),
      preferred_direction_trace_costs: z.number(),
      against_preferred_direction_trace_costs: z.number(),
    })
  ),
})

// Structure schema
export const structureSchema = z.object({
  layer: z.array(layerSchema),
  boundary: z.array(boundarySchema),
  keepout: z.array(keepoutSchema).optional(),
  via: viaSchema,
  rule: z.array(ruleSchema),
  snap_angle: z.enum(["fortyfive_degree", "ninety_degree"]),
  control: controlSchema,
  autoroute_settings: autorouteSettingsSchema,
})

// Place schema
export const placeSchema = z.object({
  component_id: z.string(),
  vertex: z.tuple([z.number(), z.number()]),
  side: z.enum(["front", "back"]),
  rotation: z.number(),
  part_number: z.string().optional(),
  pins: z
    .array(
      z.object({
        pin_id: z.string(),
        clearance_class: z.string(),
      })
    )
    .optional(),
})

// Placement schema
export const placementSchema = z.array(
  z.object({
    component: z.string(),
    place: placeSchema,
  })
)

// Image schema
export const imageSchema = z.object({
  name: z.string(),
  outlines: z
    .array(
      z.object({
        signal: z.string(),
        path: z.array(z.number()),
      })
    )
    .optional(),
  pins: z
    .array(
      z.object({
        shape: z.string(),
        rotate: z.number().optional(),
        name: z.string(),
        x: z.number(),
        y: z.number(),
      })
    )
    .optional(),
})

// Padstack schema
export const padstackSchema = z.object({
  name: z.string(),
  shapes: z.array(
    z.object({
      type: z.string(),
      layer: z.string(),
      dimensions: z.array(z.number()),
    })
  ),
  attach: z.string().optional(),
})

// Library schema
export const librarySchema = z.object({
  images: z.array(imageSchema),
  padstacks: z.array(padstackSchema),
})

// Net schema
export const netSchema = z.object({
  name: z.string(),
  pins: z.array(z.string()),
})

// Net class schema
export const netClassSchema = z.object({
  name: z.string(),
  nets: z.array(z.string()),
})

// Net connection schema
export const netConnectionSchema = z.object({
  name: z.string(),
  fromtos: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
    })
  ),
})

// Network schema
export const networkSchema = z.object({
  nets: z.array(netSchema),
  classes: z.array(netClassSchema).optional(),
  connections: z.array(netConnectionSchema).optional(),
})

// Wire schema
export const wireSchema = z.object({
  layer: z.string(),
  path: z.array(z.number()),
  net: z.string(),
  type: z.string().optional(),
  width: z.number().optional(),
})

// Wiring schema
export const wiringSchema = z.object({
  wires: z.array(wireSchema),
  vias: z
    .array(
      z.object({
        name: z.string(),
        net: z.string(),
        type: z.string(),
        x: z.number(),
        y: z.number(),
        padstack: z.string(),
      })
    )
    .optional(),
})

// Main PCB Design schema
export const pcbDesignSchema = z.object({
  pcb_id: z.string(),
  file: z.string(),
  parser: parserSchema,
  resolution: resolutionSchema,
  unit: z.string(),
  structure: structureSchema,
  placement: placementSchema,
  library: librarySchema,
  network: networkSchema,
  wiring: wiringSchema,
})
