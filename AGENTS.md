# Shift Project

## Overview
Deno-based database structure management tool (ORM, migrations). Early stage, currently on `feat.orm` branch.

## Runtime & Tooling
- **Runtime**: Deno (not Node.js)
- **Language**: TypeScript
- **Formatter**: `deno fmt` (4-space indent, double quotes)
- **No linter, test framework, or CI configured yet**

## Commands
```bash
# Format code
deno fmt

# Run CLI
deno run --allow-all src/cli.ts

# Run dbshell
deno run --allow-all src/cli.ts dbshell ./test.db
```

## Project Structure
- `src/mod.ts` — Library entry point (currently empty)
- `src/cli.ts` — CLI entry point
- `src/scripts/dbShell.ts` — Interactive SQLite shell
- `src/utils/db/` — Database abstraction layer

## Key Architecture Notes
- Uses `node:sqlite` (Deno's built-in, not third-party)
- Database interface in `src/utils/db/interfaces.ts` defines the contract
- SQLite implementation in `src/utils/db/sqlite.ts`
- Factory pattern via `createDbConnection()` in `src/utils/db/index.ts`

## Conventions
- Follow Deno style: explicit file extensions in imports
- Use `IDatabase` interface when adding new database backends
