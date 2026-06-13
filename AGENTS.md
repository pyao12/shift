# Shift Project

## Overview

Deno-based database structure management tool (ORM, migrations). Early stage,
currently on `feat.orm` branch.

## Runtime & Tooling

- **Runtime**: Deno (not Node.js) — uses `node:sqlite` built-in, not third-party
- **Language**: TypeScript
- **Formatter**: `deno fmt` (4-space indent, double quotes, see `deno.json` fmt
  config)
- **Test framework**: Deno built-in (`Deno.test`)
- **No linter or CI configured yet**

## Commands

```bash
deno fmt                  # Format code
deno test --allow-all     # Run all tests
deno run --allow-all src/cli.ts              # Run CLI
deno run --allow-all src/cli.ts dbshell ./test.db  # Run dbshell
./shift                   # Wrapper script (includes shebang permissions)
```

Always run `deno fmt` before committing. The `shift` wrapper script is NOT
visible to `deno fmt` (shebang quirk) — format `src/cli.ts` directly.

## Project Structure

- `src/mod.ts` — Library entry point (re-exports ORM API)
- `src/cli.ts` — CLI entry point
- `src/orm/` — ORM: schema builders, QuerySet, types
- `src/utils/db/` — Database abstraction (`IDatabase` interface + SQLite impl)
- `tests/` — Test files, uses `tests/helpers.ts` for shared setup
- `shift` — Executable CLI wrapper (has shebang,
  `#!/usr/bin/env -S deno run -A`)

## Architecture

- `IDatabase` interface in `src/utils/db/interfaces.ts` — contract for backends
- `SQLiteConnection` in `src/utils/db/sqlite.ts` — `node:sqlite` implementation
- `createDbConnection()` in `src/utils/db/index.ts` — factory
- ORM: `defineModel()` creates models, `column` builders define schema
- QuerySet is chainable: `filter`, `select`, `limit`, `offset`, `orderBy`
- QuerySet write ops: `create(data)`, `update(data)`, `delete()` (terminal, not
  chainable)
- All SQL is parameterized — never interpolate user values into SQL strings

## Conventions

- Explicit `.ts` extensions in all imports (Deno convention)
- Use `IDatabase` interface when adding new database backends
- Test files go in `tests/` directory, use `@std/assert`
- `*.db*` files are gitignored — never commit database files
- `.mimocode` directory is gitignored

## Test Helpers Gotcha

`tests/helpers.ts` `cleanDb()` removes `.db` + WAL/journal sidecar files
(`-wal`, `-shm`, `-journal`). When adding new test helpers that open SQLite
connections, always clean all four suffixes or you'll get `disk I/O error` on
re-runs.
