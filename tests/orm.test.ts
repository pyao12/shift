import { assertEquals } from "@std/assert";
import { column, defineModel, QuerySet } from "../src/mod.ts";
import { getDb, setupUserDb } from "./helpers.ts";

Deno.test("column.integer builds INTEGER column", () => {
    const col = column.integer();
    assertEquals(col._definition.type, "INTEGER");
    assertEquals(col._definition.primaryKey, false);
    assertEquals(col._definition.autoIncrement, false);
    assertEquals(col._definition.nullable, false);
    assertEquals(col._definition.unique, false);
});

Deno.test("column.text builds TEXT column", () => {
    const col = column.text();
    assertEquals(col._definition.type, "TEXT");
});

Deno.test("column.real builds REAL column", () => {
    const col = column.real();
    assertEquals(col._definition.type, "REAL");
});

Deno.test("column.blob builds BLOB column", () => {
    const col = column.blob();
    assertEquals(col._definition.type, "BLOB");
});

Deno.test("ColumnBuilder.primaryKey()", () => {
    const col = column.integer().primaryKey();
    assertEquals(col._definition.primaryKey, true);
});

Deno.test("ColumnBuilder.autoIncrement()", () => {
    const col = column.integer().autoIncrement();
    assertEquals(col._definition.autoIncrement, true);
});

Deno.test("ColumnBuilder.nullable()", () => {
    const col = column.text().nullable();
    assertEquals(col._definition.nullable, true);
});

Deno.test("ColumnBuilder.notNull()", () => {
    const col = column.text().nullable().notNull();
    assertEquals(col._definition.nullable, false);
});

Deno.test("ColumnBuilder.unique()", () => {
    const col = column.text().unique();
    assertEquals(col._definition.unique, true);
});

Deno.test("ColumnBuilder.default()", () => {
    const col = column.text().default("hello");
    assertEquals(col._definition.default, "hello");
});

Deno.test("ColumnBuilder chains fluently", () => {
    const col = column.integer().primaryKey().autoIncrement();
    assertEquals(col._definition.primaryKey, true);
    assertEquals(col._definition.autoIncrement, true);
});

Deno.test("defineModel returns schema with tableName and columns", () => {
    const User = defineModel("users", {
        id: column.integer().primaryKey(),
        name: column.text(),
    });
    assertEquals(User.tableName, "users");
    assertEquals(User.columns.id._definition.type, "INTEGER");
    assertEquals(User.columns.name._definition.type, "TEXT");
});

Deno.test("defineModel.objects returns a QuerySet", () => {
    const db = getDb();
    const User = defineModel("users", {
        id: column.integer().primaryKey(),
        name: column.text(),
    });
    const qs = User.objects(db);
    assertEquals(qs instanceof QuerySet, true);
});

Deno.test("QuerySet.create inserts a row", () => {
    const { db, User } = setupUserDb();
    User.objects(db).create({ id: 5, name: "Eve", age: 28 });
    const result = User.objects(db).filter("name", "=", "Eve").first();
    assertEquals(result !== null, true);
    assertEquals((result as Record<string, unknown>).name, "Eve");
    assertEquals((result as Record<string, unknown>).age, 28);
});

Deno.test("QuerySet.create returns the inserted data", () => {
    const { db, User } = setupUserDb();
    const inserted = User.objects(db).create({
        id: 6,
        name: "Frank",
        age: 40,
    });
    assertEquals(inserted.name, "Frank");
    assertEquals(inserted.age, 40);
});

Deno.test("QuerySet.update modifies filtered rows", () => {
    const { db, User } = setupUserDb();
    User.objects(db).filter("name", "=", "Bob").update({ age: 99 });
    const result = User.objects(db).filter("name", "=", "Bob").first();
    assertEquals((result as Record<string, unknown>).age, 99);
    assertEquals(User.objects(db).count(), 4);
});

Deno.test("QuerySet.update with no filter updates all rows", () => {
    const { db, User } = setupUserDb();
    User.objects(db).update({ age: 0 });
    const results = User.objects(db).all();
    assertEquals(
        results.every((r) => (r as Record<string, unknown>).age === 0),
        true,
    );
});

Deno.test("QuerySet.delete removes filtered rows", () => {
    const { db, User } = setupUserDb();
    User.objects(db).filter("name", "=", "Bob").delete();
    assertEquals(User.objects(db).count(), 3);
    assertEquals(
        User.objects(db).filter("name", "=", "Bob").exists(),
        false,
    );
});

Deno.test("QuerySet.delete with no filter removes all rows", () => {
    const { db, User } = setupUserDb();
    User.objects(db).delete();
    assertEquals(User.objects(db).count(), 0);
});

Deno.test("create + filter + all roundtrip", () => {
    const { db, User } = setupUserDb();
    User.objects(db).create({ id: 5, name: "Eve", age: 28 });
    User.objects(db).create({ id: 6, name: "Frank", age: 40 });
    const adults = User.objects(db)
        .filter("age", ">=", 30)
        .orderBy("name", "ASC")
        .all();
    assertEquals(adults.length, 3);
    assertEquals(
        adults.map((r) => (r as Record<string, unknown>).name),
        ["Alice", "Diana", "Frank"],
    );
});

Deno.test("create + filter + update + all roundtrip", () => {
    const { db, User } = setupUserDb();
    User.objects(db).create({ id: 5, name: "Eve", age: 28 });
    User.objects(db).filter("age", "<", 25).update({ age: 100 });
    const results = User.objects(db).orderBy("name").all();
    const ages = results.map((r) => (r as Record<string, unknown>).age);
    assertEquals(ages, [30, 100, 25, 35, 28]);
});

Deno.test("create + filter + delete + all roundtrip", () => {
    const { db, User } = setupUserDb();
    User.objects(db).create({ id: 5, name: "Eve", age: 28 });
    User.objects(db).filter("age", "<", 25).delete();
    const remaining = User.objects(db).orderBy("name").all();
    assertEquals(remaining.length, 4);
    assertEquals(
        remaining.map((r) => (r as Record<string, unknown>).name),
        ["Alice", "Charlie", "Diana", "Eve"],
    );
});
