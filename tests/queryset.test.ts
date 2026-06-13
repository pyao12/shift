import { assertEquals, assertStrictEquals } from "@std/assert";
import { setupUserDb } from "./helpers.ts";

Deno.test("QuerySet.all returns all rows", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).all();
    assertEquals(results.length, 4);
});

Deno.test("QuerySet.first returns first row or null", () => {
    const { db, User } = setupUserDb();
    const first = User.objects(db).first();
    assertEquals(first !== null, true);
    assertEquals((first as Record<string, unknown>).name, "Alice");

    const empty = User.objects(db).filter("id", "=", 999).first();
    assertStrictEquals(empty, null);
});

Deno.test("QuerySet.filter with = operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("name", "=", "Bob").all();
    assertEquals(results.length, 1);
    assertEquals((results[0] as Record<string, unknown>).name, "Bob");
});

Deno.test("QuerySet.filter with != operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("name", "!=", "Bob").all();
    assertEquals(results.length, 3);
});

Deno.test("QuerySet.filter with > operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("age", ">", 25).all();
    assertEquals(results.length, 2);
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).name).sort(),
        ["Alice", "Diana"],
    );
});

Deno.test("QuerySet.filter with >= operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("age", ">=", 25).all();
    assertEquals(results.length, 3);
});

Deno.test("QuerySet.filter with < operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("age", "<", 25).all();
    assertEquals(results.length, 1);
    assertEquals((results[0] as Record<string, unknown>).name, "Bob");
});

Deno.test("QuerySet.filter with <= operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("age", "<=", 25).all();
    assertEquals(results.length, 2);
});

Deno.test("QuerySet.filter with LIKE operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).filter("name", "LIKE", "A%").all();
    assertEquals(results.length, 1);
    assertEquals((results[0] as Record<string, unknown>).name, "Alice");
});

Deno.test("QuerySet.filter with IN operator", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db)
        .filter("name", "IN", ["Alice", "Charlie"])
        .all();
    assertEquals(results.length, 2);
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).name).sort(),
        ["Alice", "Charlie"],
    );
});

Deno.test("QuerySet chaining multiple filters", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db)
        .filter("age", ">", 20)
        .filter("age", "<", 35)
        .all();
    assertEquals(results.length, 2);
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).name).sort(),
        ["Alice", "Charlie"],
    );
});

Deno.test("QuerySet.select picks specific columns", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).select(["name"]).all();
    assertEquals(results.length, 4);
    for (const row of results) {
        assertEquals((row as Record<string, unknown>).name !== undefined, true);
        assertEquals((row as Record<string, unknown>).age, undefined);
    }
});

Deno.test("QuerySet.limit restricts result count", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).limit(2).all();
    assertEquals(results.length, 2);
});

Deno.test("QuerySet.offset skips rows", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).offset(2).all();
    assertEquals(results.length, 2);
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).name),
        ["Charlie", "Diana"],
    );
});

Deno.test("QuerySet.limit + offset pagination", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).limit(2).offset(1).all();
    assertEquals(results.length, 2);
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).name),
        ["Bob", "Charlie"],
    );
});

Deno.test("QuerySet.orderBy ASC", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).orderBy("age", "ASC").all();
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).age),
        [20, 25, 30, 35],
    );
});

Deno.test("QuerySet.orderBy DESC", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).orderBy("age", "DESC").all();
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).age),
        [35, 30, 25, 20],
    );
});

Deno.test("QuerySet.orderBy default is ASC", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db).orderBy("age").all();
    assertEquals(
        results.map((r) => (r as Record<string, unknown>).age),
        [20, 25, 30, 35],
    );
});

Deno.test("QuerySet.count returns correct count", () => {
    const { db, User } = setupUserDb();
    assertEquals(User.objects(db).count(), 4);
    assertEquals(User.objects(db).filter("age", ">", 25).count(), 2);
    assertEquals(User.objects(db).filter("id", "=", 999).count(), 0);
});

Deno.test("QuerySet.exists returns boolean", () => {
    const { db, User } = setupUserDb();
    assertEquals(User.objects(db).exists(), true);
    assertEquals(User.objects(db).filter("id", "=", 999).exists(), false);
});

Deno.test("QuerySet filter + select + limit + orderBy combined", () => {
    const { db, User } = setupUserDb();
    const results = User.objects(db)
        .filter("age", ">=", 20)
        .select(["name", "age"])
        .orderBy("age", "DESC")
        .limit(2)
        .all();
    assertEquals(results.length, 2);
    assertEquals((results[0] as Record<string, unknown>).name, "Diana");
    assertEquals((results[1] as Record<string, unknown>).name, "Alice");
});

Deno.test("QuerySet chaining does not mutate original", () => {
    const { db, User } = setupUserDb();
    const qs = User.objects(db);
    const qs2 = qs.filter("name", "=", "Bob");
    const qs3 = qs.filter("name", "=", "Charlie");
    assertEquals(qs.all().length, 4);
    assertEquals(qs2.all().length, 1);
    assertEquals(qs3.all().length, 1);
});
