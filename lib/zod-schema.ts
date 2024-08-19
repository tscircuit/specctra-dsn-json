import { z } from "zod"

// Common shape schemas
const coordinatePair = z.tuple([z.number(), z.number()])
const coordinateArray = z.array(coordinatePair)

const baseShapeSchema = z.object({
  layer: z.string(),
  aperture_width: z.number().optional(),
})

export const circleSchema = baseShapeSchema.extend({
  type: z.literal("circle"),
  radius: z.number(),
  x: z.number().optional(),
  y: z.number().optional(),
})

const rectSchema = baseShapeSchema.extend({
  type: z.literal("rect"),
  coordinates: z.tuple([coordinatePair, coordinatePair]),
})

const pathSchema = baseShapeSchema.extend({
  type: z.enum(["path", "polyline_path"]),
  width: z.number(),
  coordinates: coordinateArray,
})

const polygonSchema = baseShapeSchema.extend({
  type: z.literal("polygon"),
  coordinates: coordinateArray,
})

export const shapeSchema = z.discriminatedUnion("type", [
  circleSchema,
  rectSchema,
  pathSchema,
  polygonSchema,
])

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
export const boundarySchema = shapeSchema

// Keepout schema
export const keepoutSchema = z.object({
  id: z.string().optional(),
  shape: shapeSchema,
  aperture_width: z.number().optional(),
  clearance_class: z.string().optional(),
})

// Via schema
export const viaSchema = z.object({
  primary_padstack: z.string(),
  x: z.number().optional(),
  y: z.number().optional(),
  net: z.string().optional(),
  net_code: z.string().optional(),
  via_type: z.string().optional(),
  clearance_class: z.string().optional(),
  spare_padstacks: z.array(z.string()).optional(),
  property: z.string().optional(),
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
  layers: z.array(layerSchema),
  boundaries: z.array(boundarySchema),
  keepouts: z.array(keepoutSchema).optional(),
  via: viaSchema,
  rules: z.array(ruleSchema),
  snap_angle: z.enum(["fortyfive_degree", "ninety_degree"]).optional(),
  control: controlSchema.optional(),
  autoroute_settings: autorouteSettingsSchema.optional(),
})

const sideSchema = z.enum(["front", "back"])

// Place schema
export const placeSchema = z.object({
  component_id: z.string(),
  x: z.number(),
  y: z.number(),
  side: sideSchema,
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
    places: z.array(placeSchema),
  })
)

// Image schema
export const imageSchema = z.object({
  name: z.string(),
  outlines: z.array(shapeSchema).optional(),
  pins: z
    .array(
      z.object({
        type: z.string(),
        id: z.string(),
        x: z.number(),
        y: z.number(),
        rotate: z.number().optional(),
      })
    )
    .optional(),
  keepouts: z.array(keepoutSchema).optional(),
  side: sideSchema.optional(),
})

// Padstack schema
export const padstackSchema = z.object({
  name: z.string(),
  shapes: z.array(shapeSchema),
  attach: z.string().optional(),
})

// Library schema
export const librarySchema = z.array(
  z
    .object({
      image: imageSchema,
    })
    .or(
      z.object({
        padstack: padstackSchema,
      })
    )
)

// Net schema
export const netSchema = z.object({
  name: z.string(),
  net_number: z.string().optional(),
  pins: z.union([z.string(), z.array(z.string())]),
})

// Via rule schema
export const viaRuleSchema = z.object({
  name: z.string(),
  via: z.string(),
})

// Class schema
export const classSchema = z.object({
  name: z.string(),
  nets: z.array(z.string()),
  circuit: z
    .record(z.string(), z.union([z.string(), z.array(z.string())]))
    .optional(),
  rule: ruleSchema.optional(),
  clearance_class: z.string().optional(),
  via_rule: z.string().optional(),
})

// Network schema
export const networkSchema = z.object({
  nets: z.array(netSchema).optional(),
  vias: z.array(viaSchema).optional(),
  via_rules: z.array(viaRuleSchema).optional(),
  classes: z.array(classSchema).optional(),
})

// Wire schema
export const wireSchema = z.object({
  shape: shapeSchema,
  net: z.string(),
  type: z.string().optional(),
  clearance_class: z.string().optional(),
})

// Wiring schema
export const wiringSchema = z.object({
  wires: z.array(wireSchema),
  vias: z.array(viaSchema),
})

// Main PCB Design schema
export const pcbDesignSchema = z.object({
  pcb_id: z.string(),
  parser: parserSchema,
  resolution: resolutionSchema,
  unit: z.string(),
  structure: structureSchema,
  placement: placementSchema,
  library: librarySchema,
  network: networkSchema,
  wiring: wiringSchema,
})
