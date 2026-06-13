import type IDatabase from "../utils/db/interfaces.ts";

export type ColumnType = "INTEGER" | "TEXT" | "REAL" | "BLOB";

export interface ColumnDefinition {
    type: ColumnType;
    primaryKey: boolean;
    autoIncrement: boolean;
    nullable: boolean;
    unique: boolean;
    default?: unknown;
}

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

export type InferRow<M extends ModelSchema> = {
    [K in keyof M["columns"]]: InferColumnType<M["columns"][K]>;
};

import type { QuerySet } from "./queryset.ts";
