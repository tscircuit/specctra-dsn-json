# Specctra DSN JSON Parser

This library parses Specctra DSN files and converts them into JSON. It can
also convert Specctra DSN files into [tscircuit JSON](https://github.com/tscircuit/soup)
and serialize them back to DSN.

> This library parses Specctra DSN files and converts them into JSON for interoperability. It has no official relationship with Specctra, Cadence, or the Allegro PCB Router.

## Table of Contents

- [Specctra DSN JSON Parser](#specctra-dsn-json-parser)
  - [Table of Contents](#table-of-contents)
  - [Installation](#installation)
  - [Usage](#usage)
  - [Features](#features)
  - [Development](#development)
  - [References](#references)
  - [Contributing](#contributing)
  - [License](#license)

## Installation

To install the package, run:

```bash
npm install specctra-dsn-json
```

## Usage

Here's a basic example of how to use the library:

```typescript
import { parseDsnToJson } from "@tscircuit/specctra-dsn-json"

const dsnContent = `
(pcb "example.dsn"
  (parser
    (string_quote ")
    (space_in_quoted_tokens on)
  )
  (resolution um 10)
  (unit um)
  ...
)
`

const jsonOutput = parseDsnToJson(dsnContent)
console.log(JSON.stringify(jsonOutput, null, 2))
```

## Features

- Parses Specctra DSN files into a structured JSON format
- Supports various elements of the DSN format including:
  - Parser information
  - Resolution and units
  - Structure (layers, boundaries, vias, rules)
  - Component placement
  - Library definitions
  - Network and wiring information
- Provides a type-safe interface using Zod schemas

## Development

To set up the project for development:

1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`

To build the project:

```bash
npm run build
```

## References

- [Specctra Language Reference (Hackaday.io)](https://cdn.hackaday.io/files/1666717130852064/specctra.pdf)
- [Example Specctra DSN files (FreeRouting)](https://github.com/freerouting/freerouting/tree/master/tests)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
