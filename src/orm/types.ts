import type IDatabase from "../utils/db/interfaces.ts";

/**
 * Supported SQLite column data types.
 */
export type ColumnType = "INTEGER" | "TEXT" | "REAL" | "BLOB";

/**
 * Describes a single column's SQL type, constraints, and optional default value.
 */
export interface ColumnDefinition {
    type: ColumnType;
    primaryKey: boolean;
    autoIncrement: boolean;
    nullable: boolean;
    unique: boolean;
    default?: unknown;
}

/**
 * The base interface for a model schema, parameterized by its column map.
 *
 * @typeParam T - A record mapping column names to their builder types.
 */
export interface ModelSchema<
    T extends Record<string, { _definition: ColumnDefinition }> = Record<
        string,
        { _definition: ColumnDefinition }
    >,
> {
    tableName: string;
    columns: T;
    objects: (db: IDatabase) => QuerySet<Record<string, unknown>>;
}

type SqlTypeToTs<T extends ColumnType> = T extends "INTEGER" ? number
    : T extends "REAL" ? number
    : T extends "TEXT" ? string
    : T extends "BLOB" ? Uint8Array
    : never;

type InferColumnType<C extends { _definition: ColumnDefinition }> =
    C["_definition"]["nullable"] extends true
        ? SqlTypeToTs<C["_definition"]["type"]> | null
        : SqlTypeToTs<C["_definition"]["type"]>;

/**
 * Infers the TypeScript row type from a model schema.
 *
 * Maps each column to its corresponding TS type based on the SQL type,
 * and applies `| null` for nullable columns.
 */
export type InferRow<M extends ModelSchema> = {
    [K in keyof M["columns"]]: InferColumnType<M["columns"][K]>;
};

import type { QuerySet } from "./queryset.ts";
