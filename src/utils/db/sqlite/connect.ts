import { DatabaseSync } from "node:sqlite";
import type IDatabase from "../interfaces.ts";

class SQLiteConnection implements IDatabase {
    _db: DatabaseSync;
    constructor(url: string) {
        this._db = new DatabaseSync(url);
    }

    demo() {
        console.log("SQLite!");
    }
}

export default SQLiteConnection;
