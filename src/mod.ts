/**
 * Shift ORM - A lightweight database structure management toolkit for Deno.
 *
 * Provides schema definition, model builders, and chainable query sets for
 * working with SQLite databases through the `node:sqlite` API.
 *
 * @example
 * ```ts
 * import { column, defineModel } from "@pyao12/shift";
 *
 * const User = defineModel("users", {
 *     id: column.integer().primaryKey().autoIncrement(),
 *     name: column.text().notNull(),
 *     email: column.text().unique(),
 * });
 * ```
 */
export { column, ColumnBuilder, defineModel, QuerySet } from "./orm/index.ts";
export type {
    BuiltModelSchema,
    ColumnDefinition,
    ColumnType,
    FilterOperator,
    InferRow,
    ModelSchema,
} from "./orm/index.ts";
