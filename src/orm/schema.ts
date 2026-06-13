import type { ColumnDefinition, ColumnType } from "./types.ts";
import { QuerySet } from "./queryset.ts";
import type IDatabase from "../utils/db/interfaces.ts";

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

    primaryKey(): this {
        this._definition.primaryKey = true;
        return this;
    }

    autoIncrement(): this {
        this._definition.autoIncrement = true;
        return this;
    }

    nullable(): this {
        this._definition.nullable = true;
        return this;
    }

    notNull(): this {
        this._definition.nullable = false;
        return this;
    }

    unique(): this {
        this._definition.unique = true;
        return this;
    }

    default(v: unknown): this {
        this._definition.default = v;
        return this;
    }
}

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

interface BuiltModelSchema<T extends ColumnBuilderMap> {
    tableName: string;
    columns: BuiltColumns<T>;
    objects: (db: IDatabase) => QuerySet<Record<string, unknown>>;
}

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
