import type { ColumnDefinition, ColumnType } from "./types.ts";
import { QuerySet } from "./queryset.ts";
import type IDatabase from "../utils/db/interfaces.ts";

/**
 * Fluent builder for configuring a column's type and constraints.
 *
 * Use the {@link column} factory to create instances, then chain methods
 * like {@link ColumnBuilder.primaryKey}, {@link ColumnBuilder.nullable}, etc.
 */
export class ColumnBuilder {
    _definition: ColumnDefinition;

    constructor(type: ColumnType) {
        this._definition = {
            type,
            primaryKey: false,
            autoIncrement: false,
            nullable: false,
            unique: false,
        };
    }

    /** Marks this column as the primary key. */
    primaryKey(): this {
        this._definition.primaryKey = true;
        return this;
    }

    /** Enables auto-increment (INTEGER PRIMARY KEY only). */
    autoIncrement(): this {
        this._definition.autoIncrement = true;
        return this;
    }

    /** Allows this column to hold NULL values. */
    nullable(): this {
        this._definition.nullable = true;
        return this;
    }

    /** Explicitly disallows NULL values (default). */
    notNull(): this {
        this._definition.nullable = false;
        return this;
    }

    /** Adds a UNIQUE constraint to this column. */
    unique(): this {
        this._definition.unique = true;
        return this;
    }

    /** Sets a default value for this column when omitted during insert. */
    default(v: unknown): this {
        this._definition.default = v;
        return this;
    }
}

/**
 * Factory for creating {@link ColumnBuilder} instances by SQL type.
 *
 * @example
 * ```ts
 * column.integer().primaryKey().autoIncrement();
 * column.text().notNull().unique();
 * ```
 */
export const column = {
    integer: (): ColumnBuilder => new ColumnBuilder("INTEGER"),
    text: (): ColumnBuilder => new ColumnBuilder("TEXT"),
    real: (): ColumnBuilder => new ColumnBuilder("REAL"),
    blob: (): ColumnBuilder => new ColumnBuilder("BLOB"),
};

type ColumnBuilderMap = Record<string, ColumnBuilder>;

type BuiltColumns<T extends ColumnBuilderMap> = {
    [K in keyof T]: T[K] extends ColumnBuilder ? T[K] : never;
};

/**
 * The fully resolved shape of a model schema after {@link defineModel} processes
 * the column builders. Includes the table name, built columns, and an `objects`
 * factory that returns a {@link QuerySet} bound to a database connection.
 */
export interface BuiltModelSchema<T extends ColumnBuilderMap> {
    tableName: string;
    columns: BuiltColumns<T>;
    objects: (db: IDatabase) => QuerySet<Record<string, unknown>>;
}

/**
 * Defines a database model from a table name and a map of column builders.
 *
 * Returns a {@link BuiltModelSchema} whose `objects(db)` method produces a
 * {@link QuerySet} for querying and mutating the table.
 *
 * @param tableName - The SQLite table name.
 * @param columns - A record of column name to {@link ColumnBuilder}.
 * @returns A built model schema ready for use.
 */
export function defineModel<T extends ColumnBuilderMap>(
    tableName: string,
    columns: T,
): BuiltModelSchema<T> {
    const built = {} as BuiltColumns<T>;
    for (const key in columns) {
        (built as Record<string, ColumnBuilder>)[key] = columns[key];
    }
    return {
        tableName,
        columns: built,
        objects: (db: IDatabase) => {
            return new QuerySet(
                { tableName, columns: built } as {
                    tableName: string;
                    columns: Record<string, { _definition: ColumnDefinition }>;
                },
                db,
            );
        },
    } as BuiltModelSchema<T>;
}
