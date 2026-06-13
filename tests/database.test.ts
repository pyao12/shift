import { assertEquals } from "@std/assert";
import { cleanDb, getDb } from "./helpers.ts";

Deno.test("createDbConnection returns SQLite instance", () => {
    const db = getDb();
    assertEquals(typeof db.demo, "function");
    assertEquals(typeof db.execute, "function");
    assertEquals(typeof db.create, "function");
    assertEquals(typeof db.insert, "function");
    assertEquals(typeof db.select, "function");
    assertEquals(typeof db.delete, "function");
});

Deno.test("db.create creates a table", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    const tables = db.select("sqlite_master", {
        columns: ["name"],
        where: "type='table'",
    }) as { name: string }[];
    assertEquals(tables.some((t) => t.name === "users"), true);
});

Deno.test("db.insert and db.select roundtrip", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    const rows = db.select("users") as { id: number; name: string }[];
    assertEquals(rows.length, 2);
    assertEquals(rows[0].name, "Alice");
    assertEquals(rows[1].name, "Bob");
});

Deno.test("db.select with where clause", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    db.insert("users", { id: 2, name: "Bob", age: 20 });
    db.insert("users", { id: 3, name: "Charlie", age: 25 });
    const rows = db.select("users", {
        where: "age > ?",
        params: [22],
    }) as { id: number; name: string }[];
    assertEquals(rows.length, 2);
    assertEquals(rows.map((r) => r.name).sort(), ["Alice", "Charlie"]);
});

Deno.test("db.select with columns", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    const rows = db.select("users", { columns: ["name"] }) as {
        name: string;
    }[];
    assertEquals(rows.length, 1);
    assertEquals(rows[0].name, "Alice");
    assertEquals((rows[0] as Record<string, unknown>).age, undefined);
});

Deno.test("db.select with orderBy", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    db.insert("users", { id: 2, name: "Bob", age: 20 });
    const rows = db.select("users", { orderBy: "age DESC" }) as {
        name: string;
    }[];
    assertEquals(rows[0].name, "Alice");
    assertEquals(rows[1].name, "Bob");
});

Deno.test("db.select with limit", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    db.insert("users", { id: 3, name: "Charlie" });
    const rows = db.select("users", { limit: 2 }) as { name: string }[];
    assertEquals(rows.length, 2);
});

Deno.test("db.select with offset", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    db.insert("users", { id: 3, name: "Charlie" });
    const rows = db.select("users", { limit: 2, offset: 1 }) as {
        name: string;
    }[];
    assertEquals(rows.length, 2);
    assertEquals(rows[0].name, "Bob");
    assertEquals(rows[1].name, "Charlie");
});

Deno.test("db.select with limit and no offset uses LIMIT -1", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    const rows = db.select("users", { offset: 1 }) as { name: string }[];
    assertEquals(rows.length, 1);
    assertEquals(rows[0].name, "Bob");
});

Deno.test("db.delete with where", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    db.delete("users", "name = ?", ["Bob"]);
    const rows = db.select("users") as { name: string }[];
    assertEquals(rows.length, 1);
    assertEquals(rows[0].name, "Alice");
});

Deno.test("db.delete all rows without where", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
    ]);
    db.insert("users", { id: 1, name: "Alice" });
    db.insert("users", { id: 2, name: "Bob" });
    db.delete("users");
    const rows = db.select("users") as { name: string }[];
    assertEquals(rows.length, 0);
});

Deno.test("db.update modifies rows", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    db.insert("users", { id: 2, name: "Bob", age: 20 });
    db.update("users", { age: 99 }, "name = ?", ["Alice"]);
    const rows = db.select("users", {
        where: "name = ?",
        params: ["Alice"],
    }) as { age: number }[];
    assertEquals(rows[0].age, 99);
});

Deno.test("db.update all rows without where", () => {
    const db = getDb();
    db.create("users", [
        { name: "id", type: "INTEGER PRIMARY KEY" },
        { name: "name", type: "TEXT" },
        { name: "age", type: "INTEGER" },
    ]);
    db.insert("users", { id: 1, name: "Alice", age: 30 });
    db.insert("users", { id: 2, name: "Bob", age: 20 });
    db.update("users", { age: 0 });
    const rows = db.select("users") as { age: number }[];
    assertEquals(rows.every((r) => r.age === 0), true);
});

Deno.test("db.execute runs raw SQL", () => {
    const db = getDb();
    db.create("nums", [{ name: "v", type: "INTEGER" }]);
    db.execute("INSERT INTO nums (v) VALUES (42)");
    const rows = db.select("nums") as { v: number }[];
    assertEquals(rows[0].v, 42);
});

Deno.test("cleanup test db", () => {
    cleanDb();
});
