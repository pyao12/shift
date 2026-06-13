import { assertEquals } from "@std/assert";
import { column, defineModel, QuerySet } from "../src/mod.ts";
import { getDb } from "./helpers.ts";

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
