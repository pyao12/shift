import type IDatabase from "../utils/db/interfaces.ts";
import type { ColumnDefinition } from "./types.ts";

/**
 * SQL comparison operators supported by {@link QuerySet.filter}.
 */
export type FilterOperator =
    | "="
    | "!="
    | "<"
    | "<="
    | ">"
    | ">="
    | "LIKE"
    | "IN";

interface FilterClause {
    column: string;
    op: FilterOperator;
    value: unknown;
}

/**
 * Chainable query builder for reading and writing rows in a model's table.
 *
 * All filter/select/limit/offset/orderBy methods return a new {@link QuerySet}
 * (immutable chaining). Terminal methods (`all`, `first`, `count`, `exists`,
 * `create`, `update`, `delete`) execute the query against the database.
 */
export class QuerySet<T> {
    private _model: {
        tableName: string;
        columns: Record<string, { _definition: ColumnDefinition }>;
    };
    private _db: IDatabase;
    private _filters: FilterClause[] = [];
    private _selectColumns: string[] | null = null;
    private _limitValue: number | null = null;
    private _offsetValue: number | null = null;
    private _orderByClause: string | null = null;

    constructor(
        model: {
            tableName: string;
            columns: Record<string, { _definition: ColumnDefinition }>;
        },
        db: IDatabase,
    ) {
        this._model = model;
        this._db = db;
    }

    private _clone(): QuerySet<T> {
        const q = new QuerySet<T>(this._model, this._db);
        q._filters = [...this._filters];
        q._selectColumns = this._selectColumns;
        q._limitValue = this._limitValue;
        q._offsetValue = this._offsetValue;
        q._orderByClause = this._orderByClause;
        return q;
    }

    /** Adds a WHERE clause for the given column, operator, and value. */
    filter(column: string, op: FilterOperator, value: unknown): QuerySet<T> {
        const q = this._clone();
        q._filters.push({ column, op, value });
        return q;
    }

    /** Restricts the result to the specified columns (SELECT projection). */
    select(columns: string[]): QuerySet<T> {
        const q = this._clone();
        q._selectColumns = columns;
        return q;
    }

    /** Limits the result set to at most `n` rows. */
    limit(n: number): QuerySet<T> {
        const q = this._clone();
        q._limitValue = n;
        return q;
    }

    /** Skips the first `n` rows in the result set. */
    offset(n: number): QuerySet<T> {
        const q = this._clone();
        q._offsetValue = n;
        return q;
    }

    /** Orders results by the given column in ascending or descending order. */
    orderBy(column: string, direction: "ASC" | "DESC" = "ASC"): QuerySet<T> {
        const q = this._clone();
        q._orderByClause = `${column} ${direction}`;
        return q;
    }

    /** Executes the query and returns all matching rows. */
    all(): T[] {
        const where = this._buildWhere();
        const params = this._expandParams();

        return this._db.select(this._model.tableName, {
            columns: this._selectColumns ?? undefined,
            where: where || undefined,
            params: params.length > 0 ? params : undefined,
            orderBy: this._orderByClause ?? undefined,
            limit: this._limitValue ?? undefined,
            offset: this._offsetValue ?? undefined,
        }) as T[];
    }

    /** Returns the first matching row, or `null` if none match. */
    first(): T | null {
        const results = this._clone().limit(1).all();
        return results[0] ?? null;
    }

    /** Returns the number of rows matching the current filters. */
    count(): number {
        const where = this._buildWhere();
        const params = this._expandParams();

        const rows = this._db.select(this._model.tableName, {
            columns: ["COUNT(*) as _count"],
            where: where || undefined,
            params: params.length > 0 ? params : undefined,
        }) as Record<string, unknown>[];

        return (rows[0]?._count as number) ?? 0;
    }

    /** Returns `true` if at least one row matches the current filters. */
    exists(): boolean {
        return this.count() > 0;
    }

    /** Inserts a new row with the given data and returns it. */
    create(data: Record<string, unknown>): Record<string, unknown> {
        this._db.insert(this._model.tableName, data);
        return data;
    }

    /** Updates all rows matching the current filters with the given data. */
    update(data: Record<string, unknown>): void {
        const where = this._buildWhere();
        const params = this._expandParams();
        this._db.update(
            this._model.tableName,
            data,
            where ?? undefined,
            params.length > 0 ? params : undefined,
        );
    }

    /** Deletes all rows matching the current filters. */
    delete(): void {
        const where = this._buildWhere();
        const params = this._expandParams();
        this._db.delete(
            this._model.tableName,
            where ?? undefined,
            params.length > 0 ? params : undefined,
        );
    }

    private _buildWhere(): string | null {
        if (this._filters.length === 0) return null;

        return this._filters
            .map((f) => {
                if (f.op === "IN") {
                    const arr = f.value as unknown[];
                    const placeholders = arr.map(() => "?").join(", ");
                    return `${f.column} IN (${placeholders})`;
                }
                return `${f.column} ${f.op} ?`;
            })
            .join(" AND ");
    }

    private _expandParams(): unknown[] {
        const result: unknown[] = [];
        for (const f of this._filters) {
            if (f.op === "IN") {
                result.push(...(f.value as unknown[]));
            } else {
                result.push(f.value);
            }
        }
        return result;
    }
}
