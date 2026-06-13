import { createDbConnection } from "../src/utils/db/index.ts";
import type IDatabase from "../src/utils/db/interfaces.ts";
import { column, defineModel } from "../src/mod.ts";

const TEST_DB = "./tests/test_all.db";

export function cleanDb() {
    for (const suffix of ["", "-wal", "-shm", "-journal"]) {
        try {
            Deno.removeSync(TEST_DB + suffix);
        } catch {
            // ignore
        }
    }
}

export function getDb(): IDatabase {
    cleanDb();
    return createDbConnection(TEST_DB, "sqlite");
}

export function setupUserDb(): {
    db: IDatabase;
    User: ReturnType<typeof defineModel>;
} {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    db.insert("users", { id: 2, name: "Bob", age: 20 });
    db.insert("users", { id: 3, name: "Charlie", age: 25 });
    db.insert("users", { id: 4, name: "Diana", age: 35 });

    const User = defineModel("users", {
        id: column.integer().primaryKey(),
        name: column.text(),
        age: column.integer(),
    });
    return { db, User };
}
