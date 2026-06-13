import { createDbConnection } from "../utils/db/index.ts";
import type IDatabase from "../utils/db/interfaces.ts";

function ask(promptText: string): string | null {
    const input = prompt(promptText);
    return input;
}

function getTables(db: IDatabase): string[] {
    const rows = db.select("sqlite_master", {
        columns: ["name"],
        where: "type='table'",
    }) as { name: string }[];
    return rows.map((r) => r.name);
}

function listTables(db: IDatabase) {
    const tables = getTables(db);
    if (tables.length === 0) {
        console.log("(no tables)");
    } else {
        tables.forEach((t) => console.log(`  ${t}`));
    }
}

function getTableColumns(
    db: IDatabase,
    tableName: string,
): { name: string; type: string }[] {
    const rows = db.select("pragma_table_info('" + tableName + "')") as {
        name: string;
        type: string;
    }[];
    return rows;
}

function showSchema(db: IDatabase, tableName: string) {
    const rows = db.select("sqlite_master", {
        columns: ["sql"],
        where: "type='table' AND name=?",
        params: [tableName],
    }) as { sql: string }[];
    if (rows.length > 0) {
        console.log(rows[0].sql + ";");
    }
}

function handleCreate(db: IDatabase) {
    const name = ask("Table name: ");
    if (!name) return;
    if (name.includes(" ") || /[^a-zA-Z0-9_]/.test(name)) {
        console.error(
            "Invalid table name. Use only letters, numbers, and underscores.",
        );
        return;
    }

    const columns: { name: string; type: string }[] = [];
    console.log("Enter columns (empty name to finish):");
    console.log("Supported types: TEXT, INTEGER, REAL, BLOB, NUMERIC");

    let idx = 1;
    while (true) {
        const colName = ask(`  Column ${idx} name (empty to finish): `);
        if (!colName) break;
        if (colName.includes(" ") || /[^a-zA-Z0-9_]/.test(colName)) {
            console.error(
                "  Invalid column name. Use only letters, numbers, and underscores.",
            );
            continue;
        }
        const colType = ask(`  Column ${idx} type [TEXT]: `) ?? "TEXT";
        columns.push({ name: colName, type: colType.toUpperCase() });
        idx++;
    }

    if (columns.length === 0) {
        console.log("No columns added. Aborted.");
        return;
    }

    try {
        db.create(name, columns);
        console.log(`Table "${name}" created.`);
        showSchema(db, name);
    } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
    }
}

function handleInsert(db: IDatabase) {
    const tables = getTables(db);
    if (tables.length === 0) {
        console.log("No tables. Create one first.");
        return;
    }

    console.log("Available tables:");
    tables.forEach((t) => console.log(`  ${t}`));
    const tableName = ask("Table name: ");
    if (!tableName || !tables.includes(tableName)) {
        console.log("Invalid table name.");
        return;
    }

    const columns = getTableColumns(db, tableName);
    const data: Record<string, unknown> = {};

    for (const col of columns) {
        const skipDefault = col.type.includes("PRIMARY") ? " (auto)" : "";
        const val = ask(`  ${col.name} (${col.type})${skipDefault}: `);
        if (val === null) return;
        if (val === "" && col.type.includes("PRIMARY")) continue;
        if (val === "") {
            data[col.name] = null;
        } else if (col.type === "INTEGER") {
            data[col.name] = parseInt(val, 10);
        } else if (col.type === "REAL" || col.type === "NUMERIC") {
            data[col.name] = parseFloat(val);
        } else {
            data[col.name] = val;
        }
    }

    if (Object.keys(data).length === 0) {
        console.log("No data to insert.");
        return;
    }

    try {
        db.insert(tableName, data);
        console.log("Inserted.");
    } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
    }
}

function handleSelect(db: IDatabase) {
    const tables = getTables(db);
    if (tables.length === 0) {
        console.log("No tables.");
        return;
    }

    console.log("Available tables:");
    tables.forEach((t) => console.log(`  ${t}`));
    const tableName = ask("Table name: ");
    if (!tableName || !tables.includes(tableName)) {
        console.log("Invalid table name.");
        return;
    }

    showSchema(db, tableName);

    console.log("WHERE examples: username = ?, age > ?, id = 1");
    const where = ask("WHERE (empty for all): ");
    const params: unknown[] = [];

    if (where) {
        const placeholders = (where.match(/\?/g) ?? []).length;
        for (let i = 0; i < placeholders; i++) {
            const p = ask(`  Param ${i + 1}: `);
            if (p === null) return;
            params.push(p);
        }
    }

    try {
        const rows = db.select(tableName, {
            where: where || undefined,
            params: params.length > 0 ? params : undefined,
        });
        if (rows.length === 0) {
            console.log("(no results)");
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }
    } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
    }
}

function handleDelete(db: IDatabase) {
    const tables = getTables(db);
    if (tables.length === 0) {
        console.log("No tables.");
        return;
    }

    console.log("Available tables:");
    tables.forEach((t) => console.log(`  ${t}`));
    const tableName = ask("Table name: ");
    if (!tableName || !tables.includes(tableName)) {
        console.log("Invalid table name.");
        return;
    }

    showSchema(db, tableName);

    console.log("WHERE examples: username = ?, age > ?, id = 1");
    const where = ask("WHERE (required): ");
    if (!where) {
        console.log(
            "WHERE is required to prevent accidental mass delete. Aborted.",
        );
        return;
    }

    const placeholders = (where.match(/\?/g) ?? []).length;
    const params: unknown[] = [];
    for (let i = 0; i < placeholders; i++) {
        const p = ask(`  Param ${i + 1}: `);
        if (p === null) return;
        params.push(p);
    }

    try {
        db.delete(tableName, where, params.length > 0 ? params : undefined);
        console.log("Deleted.");
    } catch (e) {
        console.error("Error:", e instanceof Error ? e.message : e);
    }
}

function dbShell(url: string) {
    const db = createDbConnection(url, "sqlite");
    console.log('Welcome to Shift DB Shell, enter "e" to exit.\n');

    while (true) {
        console.log("[c] Create table");
        console.log("[i] Insert data");
        console.log("[s] Select data");
        console.log("[d] Delete data");
        console.log("[l] List tables");
        console.log("[e] Exit");

        const choice = ask("\n> ");
        if (choice === null || choice === "e") break;

        switch (choice) {
            case "c":
                handleCreate(db);
                break;
            case "i":
                handleInsert(db);
                break;
            case "s":
                handleSelect(db);
                break;
            case "d":
                handleDelete(db);
                break;
            case "l":
                listTables(db);
                break;
            default:
                console.log("Unknown command.");
        }
        console.log();
    }
}

export default dbShell;
