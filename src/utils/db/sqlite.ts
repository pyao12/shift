import type IDatabase from "./interfaces.ts";

class SQLiteConnection implements IDatabase {
    _db: DatabaseSync;
    constructor(url: string) {
        this._db = new DatabaseSync(url);
    }

    demo() {
        console.log("SQLite!");
    }

    execute(sql: string) {
        this._db.exec(sql);
    }

    create(tableName: string, columns: { name: string; type: string }[]) {
        const colDefs = columns.map((c) => `${c.name} ${c.type}`).join(", ");
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${colDefs})`;
        this._db.exec(sql);
    }

    insert(tableName: string, data: Record<string, unknown>) {
        const keys = Object.keys(data);
        const placeholders = keys.map(() => "?").join(", ");
        const values = Object.values(data) as SQLInputValue[];
        const sql = `INSERT INTO ${tableName} (${
            keys.join(", ")
        }) VALUES (${placeholders})`;
        const stmt = this._db.prepare(sql);
        stmt.run(...values);
    }

    select(
        tableName: string,
        options?: {
            columns?: string[];
            where?: string;
            params?: unknown[];
            orderBy?: string;
            limit?: number;
            offset?: number;
        },
    ) {
        const cols = options?.columns?.join(", ") ?? "*";
        let sql = `SELECT ${cols} FROM ${tableName}`;
        const params = (options?.params ?? []) as SQLInputValue[];
        if (options?.where) {
            sql += ` WHERE ${options.where}`;
        }
        if (options?.orderBy) {
            sql += ` ORDER BY ${options.orderBy}`;
        }
        if (options?.limit !== undefined) {
            sql += ` LIMIT ${options.limit}`;
        } else if (options?.offset !== undefined) {
            sql += ` LIMIT -1`;
        }
        if (options?.offset !== undefined) {
            sql += ` OFFSET ${options.offset}`;
        }
        const stmt = this._db.prepare(sql);
        return stmt.all(...params);
    }

    delete(tableName: string, where?: string, params?: unknown[]) {
        let sql = `DELETE FROM ${tableName}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }
        const stmt = this._db.prepare(sql);
        if (params && params.length > 0) {
            stmt.run(...(params as SQLInputValue[]));
        } else {
            stmt.run();
        }
    }
}

import { DatabaseSync, type SQLInputValue } from "node:sqlite";
export default SQLiteConnection;
