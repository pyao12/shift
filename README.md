# Welcome to Shift!

Shift is a database structure management tool based on the Deno ecosystem. It
features ORM, database migrations, and other capabilities, similar to Django in
the Python ecosystem.

## Installation

```bash
deno add jsr:@pyao12/shift
```

## Usage

```bash
# Run CLI
deno shift

# SQLite shell
deno shift dbshell ./test.db
```

## Development

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
