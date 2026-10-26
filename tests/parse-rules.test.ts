import { describe, expect, test } from "bun:test"
import { parseDsnToJson, parseRulesToJson } from "../lib"

const sampleRules = `(rules PCB keyboard4
  (snap_angle 
    fortyfive_degree
  )
  (autoroute_settings
    (fanout off)
    (autoroute on)
    (postroute on)
    (vias on)
    (via_costs 50)
    (plane_via_costs 5)
    (start_ripup_costs 100)
    (start_pass_no 10)
    (layer_rule F.Cu
      (active on)
      (preferred_direction horizontal)
      (preferred_direction_trace_costs 1.0)
      (against_preferred_direction_trace_costs 2.5)
    )
    (layer_rule B.Cu
      (active on)
      (preferred_direction vertical)
      (preferred_direction_trace_costs 1.0)
      (against_preferred_direction_trace_costs 1.6)
    )
  )
  (rule
    (width 250.0)
    (clear 200.2)
    (clear 125.0 (type smd_to_turn_gap))
    (clear 50.0 (type smd_smd))
  )
  (padstack "Via[0-1]_800:400_um"
    (shape
      (circle F.Cu 800.0 0.0 0.0)
    )
    (shape
      (circle B.Cu 800.0 0.0 0.0)
    )
    (attach off)
  )
  (via 
    "Via[0-1]_800:400_um" "Via[0-1]_800:400_um" default
  )
  (via 
    "Via[0-1]_800:400_um-kicad_default" "Via[0-1]_800:400_um" "kicad_default"
  )
  (via_rule
    default "Via[0-1]_800:400_um"
  )
  (via_rule
    "kicad_default" "Via[0-1]_800:400_um-kicad_default"
  )
  (class default
    (clearance_class default)
    (via_rule default)
    (rule
      (width 250.0)
    )
    (circuit 
      (use_layer F.Cu B.Cu)
    )
  )
  (class "kicad_default"
    "Net-(D1-Pad2)" "ROW0" "Net-(D1-Pad1)" "COL0" "Net-(D2-Pad2)" "ROW1" "Net-(D2-Pad1)" "COL1"
    "Net-(D3-Pad2)" "Net-(D3-Pad1)" "COL2" "Net-(D4-Pad2)" "Net-(D4-Pad1)" "ROW2" "Net-(D5-Pad2)" "Net-(D5-Pad1)"
    "Net-(D6-Pad2)" "Net-(D6-Pad1)" "ROW3" "Net-(D7-Pad2)" "Net-(D7-Pad1)" "Net-(D8-Pad2)" "Net-(D8-Pad1)" "Net-(D9-Pad2)"
    "Net-(D9-Pad1)" "Net-(U1-Pad3)" "Net-(U1-Pad4)" "Net-(U1-Pad5)" "Net-(U1-Pad6)" "Net-(U1-Pad7)" "Net-(U1-Pad9)" "Net-(U1-Pad10)"
    "Net-(U1-Pad11)" "Net-(U1-Pad12)" "Net-(U1-Pad17)" "Net-(U1-Pad18)" "Net-(U1-Pad19)" "Net-(U1-Pad20)" "Net-(U1-Pad21)" "Net-(U1-Pad22)"
    "Net-(U1-Pad26)" "Net-(U1-Pad27)" "Net-(U1-Pad28)" "Net-(U1-Pad29)" "Net-(U1-Pad30)"
    (clearance_class "kicad_default")
    (via_rule kicad_default)
    (rule
      (width 250.0)
    )
    (circuit 
      (use_layer F.Cu B.Cu)
    )
  )
)`

describe("parseRulesToJson", () => {
  test("parses full Specctra .rules file into structured DsnRules JSON", () => {
    const parsed = parseRulesToJson(sampleRules)

    expect(parsed.rules_id).toBe("keyboard4")
    expect(parsed.snap_angle).toBe("fortyfive_degree")

    expect(parsed.autoroute_settings).toEqual({
      fanout: false,
      autoroute: true,
      postroute: true,
      vias: true,
      via_costs: 50,
      plane_via_costs: 5,
      start_ripup_costs: 100,
      start_pass_no: 10,
      layer_rule: [
        {
          name: "F.Cu",
          active: true,
          preferred_direction: "horizontal",
          preferred_direction_trace_costs: 1.0,
          against_preferred_direction_trace_costs: 2.5,
        },
        {
          name: "B.Cu",
          active: true,
          preferred_direction: "vertical",
          preferred_direction_trace_costs: 1.0,
          against_preferred_direction_trace_costs: 1.6,
        },
      ],
    })

    expect(parsed.rules).toEqual([
      {
        width: 250.0,
        clearances: [
          { value: 200.2, type: undefined },
          { value: 125.0, type: "smd_to_turn_gap" },
          { value: 50.0, type: "smd_smd" },
        ],
      },
    ])

    expect(parsed.padstacks).toEqual([
      {
        name: "Via[0-1]_800:400_um",
        shapes: [
          {
            type: "circle",
            layer: "F.Cu",
            radius: 800,
            x: 0,
            y: 0,
          },
          {
            type: "circle",
            layer: "B.Cu",
            radius: 800,
            x: 0,
            y: 0,
          },
        ],
        attach: "off",
      },
    ])

    expect(parsed.vias).toEqual([
      {
        primary_padstack: "Via[0-1]_800:400_um",
        spare_padstacks: ["Via[0-1]_800:400_um"],
        property: "default",
      },
      {
        primary_padstack: "Via[0-1]_800:400_um-kicad_default",
        spare_padstacks: ["Via[0-1]_800:400_um"],
        property: "kicad_default",
      },
    ])

    expect(parsed.via_rules).toEqual([
      {
        name: "default",
        via: "Via[0-1]_800:400_um",
      },
      {
        name: "kicad_default",
        via: "Via[0-1]_800:400_um-kicad_default",
      },
    ])

    expect(parsed.classes).toBeDefined()
    expect(parsed.classes).toHaveLength(2)
    expect(parsed.classes?.[0]).toEqual({
      name: "default",
      nets: [],
      clearance_class: "default",
      via_rule: "default",
      rule: {
        width: 250.0,
      },
      circuit: {
        use_layer: ["F.Cu", "B.Cu"],
      },
    })
    expect(parsed.classes?.[1]?.name).toBe("kicad_default")
    expect(parsed.classes?.[1]?.nets).toContain("Net-(D1-Pad2)")
    expect(parsed.classes?.[1]?.nets).toContain("Net-(U1-Pad30)")
    expect(parsed.classes?.[1]?.nets).toHaveLength(45)
    expect(parsed.classes?.[1]?.clearance_class).toBe("kicad_default")
    expect(parsed.classes?.[1]?.via_rule).toBe("kicad_default")
    expect(parsed.classes?.[1]?.rule).toEqual({
      width: 250.0,
    })
    expect(parsed.classes?.[1]?.circuit).toEqual({
      use_layer: ["F.Cu", "B.Cu"],
    })
  })

  test("parseDsnToJson also supports .rules files directly", () => {
    const parsed = parseDsnToJson(sampleRules) as unknown as ReturnType<
      typeof parseRulesToJson
    >
    expect(parsed.rules_id).toBe("keyboard4")
    expect(parsed.classes).toHaveLength(2)
  })
})
