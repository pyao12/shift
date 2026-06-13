# Shift Project

## Overview

Deno-based database structure management tool (ORM, migrations). Early stage,
currently on `feat.orm` branch.

## Runtime & Tooling

- **Runtime**: Deno (not Node.js)
- **Language**: TypeScript
- **Formatter**: `deno fmt` (4-space indent, double quotes)
- **Test framework**: Deno built-in (`Deno.test`)
- **No linter or CI configured yet**

## Commands

```bash
# Format code
deno fmt

# Run all tests
deno test --allow-all

# Run CLI
deno run --allow-all src/cli.ts

# Run dbshell
deno run --allow-all src/cli.ts dbshell ./test.db

# Or use the wrapper script (includes shebang permissions)
./shift
```

## Project Structure

- `src/mod.ts` — Library entry point (exports ORM API)
- `src/cli.ts` — CLI entry point
- `src/orm/` — ORM module (schema, queryset, types)
- `src/scripts/dbShell.ts` — Interactive SQLite shell
- `src/utils/db/` — Database abstraction layer
- `shift` — Executable wrapper for CLI (has shebang)

## Key Architecture Notes

- Uses `node:sqlite` (Deno's built-in, not third-party)
- Database interface in `src/utils/db/interfaces.ts` defines the contract
- SQLite implementation in `src/utils/db/sqlite.ts`
- Factory pattern via `createDbConnection()` in `src/utils/db/index.ts`
- ORM: `defineModel()` creates models, `column` builders define schema
- QuerySet provides chainable query API (filter, select, limit, offset, orderBy)

## Conventions

- Follow Deno style: explicit file extensions in imports
- Use `IDatabase` interface when adding new database backends
- Test files go in `tests/` directory
- Use `@std/assert` for test assertions
