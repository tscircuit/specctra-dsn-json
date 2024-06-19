// Top-level structure of the PCB design
export interface PCBDesign {
  pcb: string
  file: string
  parser: Parser
  resolution: Resolution
  unit: string
  structure: Structure
  placement: Placement
  library: Library
  network: Network
  wiring: Wiring
}

// Parser information
export interface Parser {
  spaceInQuotedTokens: boolean
  hostCad: string
  hostVersion: string
}

// Resolution information
export interface Resolution {
  unit: string
  value: number
}

// Structure of the PCB design, including layers, boundaries, keepouts, vias, and rules
export interface Structure {
  layers: Layer[]
  boundary: Boundary
  keepout: Keepout
  vias: Via[]
  rules: Rule[]
}

// Layer information
export interface Layer {
  name: string
  type: string
  properties: Property[]
}

// Property information for layers
export interface Property {
  index: number
}

// Boundary path information
export interface Boundary {
  path: string[]
}

// Keepout polygon information
export interface Keepout {
  type: string
  polygon: string[]
}

// Via information
export interface Via {
  name: string
  types: string[]
}

// Design rule information
export interface Rule {
  width: number
  clearances: Clearance[]
}

// Clearance information for rules
export interface Clearance {
  value: number
  type?: string
}

// Placement of components on the PCB
export interface Placement {
  components: Component[]
}

// Component information
export interface Component {
  name: string
  places: Place[]
}

// Placement details for components
export interface Place {
  reference: string
  x: number
  y: number
  side: string
  rotation: number
  partNumber: string
}

// Library of component images and padstacks
export interface Library {
  images: Image[]
  padstacks: Padstack[]
}

// Image information
export interface Image {
  name: string
  outlines: Outline[]
  pins: Pin[]
}

// Outline path information for images
export interface Outline {
  signal: string
  path: string[]
}

// Pin information for images
export interface Pin {
  shape: string
  rotate?: number
  name: string
  x: number
  y: number
}

// Padstack information
export interface Padstack {
  name: string
  shapes: Shape[]
  attach: string
}

// Shape information for padstacks
export interface Shape {
  type: string
  layer: string
  dimensions: number[]
}

// Network of connections between pins
export interface Network {
  nets: Net[]
}

// Net information
export interface Net {
  name: string
  pins: string[]
}

// Wiring information for connecting components
export interface Wiring {
  wires: Wire[]
  vias: WiringVia[]
}

// Wire path information
export interface Wire {
  layer: string
  path: string[]
  net: string
  type: string
}

// Via information for wiring
export interface WiringVia {
  name: string
  net: string
  type: string
  x: number
  y: number
}
