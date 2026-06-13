# Welcome to Shift!

Shift is a database structure management tool based on the Deno ecosystem. It
features ORM, database migrations, and other capabilities, similar to Django in
the Python ecosystem.

## Documents

> We will write documents in v1!!

## Installation

```bash
# Add as dependency (library + CLI)
deno add jsr:@pyao12/shift
```

## Usage

Usage of this project is a little confusing.

```bash
# Run CLI (no global install needed)
# You can also add a deno task in your project to execute!
deno run --allow-all jsr:@pyao12/shift/cli

# Or install globally for shorter command
deno install --global jsr:@pyao12/shift
# then you can:
deno shift-cli
```

## Development (for this project, not yours!)

```bash
# Run CLI directly
deno run --allow-all src/cli.ts

# Run tests
deno test --allow-all

# Format code
deno fmt
```

## License

This project is released under the [MIT](LICENSE) license, and anyone can create
derivative works.
