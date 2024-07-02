import { placementSchema } from "../zod-schema"
import type { Placement, Place } from "../types"

/**
  Input:

  [
    "placement",
    [
      "component",
      "Connector_IDC:IDC-Header_2x25_P2.54mm_Horizontal",
      [
        "place",
        "P1",
        "108000.0",
        "-223000.0",
        "front",
        "270",
        [
          "pin",
          "1",
          [
            "clearance_class",
            "Power"
          ]
        ],
        [
          "pin",
          "2",
          [
            "clearance_class",
            "Power"
          ]
        ],
        [
          "pin",
          "3",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "4",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "5",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "6",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "7",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "8",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "9",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "10",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "11",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "12",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "13",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "14",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "15",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "16",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "17",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "18",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "19",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "20",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "21",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "22",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "23",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "24",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "25",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "26",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "27",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "28",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "29",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "30",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "31",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "32",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "33",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "34",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "35",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "36",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "37",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "38",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "39",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "40",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "41",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "42",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "43",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "44",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "45",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "46",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "47",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "48",
          [
            "clearance_class",
            "default"
          ]
        ],
        [
          "pin",
          "49",
          [
            "clearance_class",
            "Power"
          ]
        ],
        [
          "pin",
          "50",
          [
            "clearance_class",
            "Power"
          ]
        ]
      ]
    ],
    [
      "component",
      "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
      [
        "place",
        "C2",
        "124000.0",
        "-208000.0",
        "front",
        "270",
        [
          "pin",
          "1",
          [
            "clearance_class",
            "Power"
          ]
        ],
        [
          "pin",
          "2",
          [
            "clearance_class",
            "Power"
          ]
        ]
      ]
    ],
    [
      "component",
      "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm::1",
      [
        "place",
        "C3",
        "239125.0",
        "-149800.0",
        "front",
        "270",
        [
          "pin",
          "1",
          [
            "clearance_class",
            "Power"
          ]
        ],
        [
          "pin",
          "2",
          [
            "clearance_class",
            "Power"
          ]
        ]
      ]
    ]
]

Output JSON object:

{
  "placement": [
    {
      "component": "Connector_IDC:IDC-Header_2x25_P2.54mm_Horizontal",
      "place": {
        "component_id": "P1",
        "x": 108000.0,
        "y": -223000.0,
        "side": "front",
        "rotation": 270,
        "pins": [
          {"pin_id": "1", "clearance_class": "Power"},
          {"pin_id": "2", "clearance_class": "Power"},
          {"pin_id": "3", "clearance_class": "default"},
          {"pin_id": "4", "clearance_class": "default"},
          {"pin_id": "5", "clearance_class": "default"},
          {"pin_id": "6", "clearance_class": "default"},
          {"pin_id": "7", "clearance_class": "default"},
          {"pin_id": "8", "clearance_class": "default"},
          {"pin_id": "9", "clearance_class": "default"},
          {"pin_id": "10", "clearance_class": "default"},
          {"pin_id": "11", "clearance_class": "default"},
          {"pin_id": "12", "clearance_class": "default"},
          {"pin_id": "13", "clearance_class": "default"},
          {"pin_id": "14", "clearance_class": "default"},
          {"pin_id": "15", "clearance_class": "default"},
          {"pin_id": "16", "clearance_class": "default"},
          {"pin_id": "17", "clearance_class": "default"},
          {"pin_id": "18", "clearance_class": "default"},
          {"pin_id": "19", "clearance_class": "default"},
          {"pin_id": "20", "clearance_class": "default"},
          {"pin_id": "21", "clearance_class": "default"},
          {"pin_id": "22", "clearance_class": "default"},
          {"pin_id": "23", "clearance_class": "default"},
          {"pin_id": "24", "clearance_class": "default"},
          {"pin_id": "25", "clearance_class": "default"},
          {"pin_id": "26", "clearance_class": "default"},
          {"pin_id": "27", "clearance_class": "default"},
          {"pin_id": "28", "clearance_class": "default"},
          {"pin_id": "29", "clearance_class": "default"},
          {"pin_id": "30", "clearance_class": "default"},
          {"pin_id": "31", "clearance_class": "default"},
          {"pin_id": "32", "clearance_class": "default"},
          {"pin_id": "33", "clearance_class": "default"},
          {"pin_id": "34", "clearance_class": "default"},
          {"pin_id": "35", "clearance_class": "default"},
          {"pin_id": "36", "clearance_class": "default"},
          {"pin_id": "37", "clearance_class": "default"},
          {"pin_id": "38", "clearance_class": "default"},
          {"pin_id": "39", "clearance_class": "default"},
          {"pin_id": "40", "clearance_class": "default"},
          {"pin_id": "41", "clearance_class": "default"},
          {"pin_id": "42", "clearance_class": "default"},
          {"pin_id": "43", "clearance_class": "default"},
          {"pin_id": "44", "clearance_class": "default"},
          {"pin_id": "45", "clearance_class": "default"},
          {"pin_id": "46", "clearance_class": "default"},
          {"pin_id": "47", "clearance_class": "default"},
          {"pin_id": "48", "clearance_class": "default"},
          {"pin_id": "49", "clearance_class": "Power"},
          {"pin_id": "50", "clearance_class": "Power"}
        ]
      }
    },
    {
      "component": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm",
      "place": {
        "component_id": "C2",
        "x": 124000.0,
        "y": -208000.0,
        "side": "front",
        "rotation": 270,
        "pins": [
          {"pin_id": "1", "clearance_class": "Power"},
          {"pin_id": "2", "clearance_class": "Power"}
        ]
      }
    },
    {
      "component": "Capacitor_THT:C_Disc_D5.0mm_W2.5mm_P5.00mm::1",
      "place": {
        "component_id": "C3",
        "x": 239125.0,
        "y": -149800.0,
        "side": "front",
        "rotation": 270,
        "pins": [
          {"pin_id": "1", "clearance_class": "Power"},
          {"pin_id": "2", "clearance_class": "Power"}
        ]
      }
    }
  ]
}

  DSN Specctra placement reference:
  The <placement_descriptor> in the SPECCTRA Design Language includes the following properties and values:

placement: The main descriptor for placement information.

unit_descriptor (optional): Specifies the unit of measurement.
resolution_descriptor (optional): Specifies the resolution.
null (optional): Indicates the absence of a unit or resolution descriptor.
place_control_descriptor (optional): Controls specific placement behaviors.
component_instance (required): Describes the component instance.
component_instance: Contains information about a specific component's placement.

component: Defines the component with its image ID.
placement_reference: Detailed placement information for the component.
placement_reference: Specifies placement details for a component.

component_id: The ID of the component being placed.
vertex (optional): Coordinates for the placement.
side (optional): Indicates the side of the PCB (e.g., front, back).
rotation (optional): Rotation angle of the component.
mirror_descriptor (optional): Specifies if the component is mirrored.
component_status_descriptor (optional): Status of the component (e.g., added, deleted, substituted).
logical_part_id (optional): Logical part ID.
place_rule_descriptor (optional): Placement rules for the component.
component_property_descriptor (optional): Properties of the component.
lock_type (optional): Lock types for the component (e.g., position, gate, subgate, pin).
rule_descriptor (optional): Rules applied to the component.
region_descriptor (optional): Region information.
PN (optional): Part number.
place_control_descriptor: Controls for the placement process.

flip_style_descriptor (optional): Specifies flip style behavior.
component_property_descriptor: Defines properties of the component.

physical_property_descriptor: Physical properties.
electrical_value_descriptor: Electrical values.
property_value_descriptor: General property values.

 */

export function parseSexprPlacement(elements: any[]): Placement {
  const placement: Placement = []

  elements.forEach((element) => {
    const [componentType, componentName, ...placementElements] = element
    if (componentType !== "component") return

    const componentPlacement: {
      component: string
      placement_reference: { place: Place }[]
    } = {
      component: componentName,
      placement_reference: [],
    }

    placementElements.forEach((placeElement: any[]) => {
      if (placeElement[0] !== "place") return

      const place = parsePlace(placeElement)
      componentPlacement.placement_reference.push({ place })
    })

    placement.push(componentPlacement)
  })

  return placementSchema.parse(placement)
}

function parsePlace(placeElement: any[]): Place {
  const [, componentId, x, y, side, rotation, ...properties] = placeElement
  const place: Place = {
    component_id: componentId,
    vertex: [parseFloat(x), parseFloat(y)],
    side: side as "front" | "back",
    rotation: parseFloat(rotation),
  }

  properties.forEach((prop: any[]) => {
    if (prop[0] === "PN") {
      place.part_number = prop[1]
    }
  })

  return place
}
