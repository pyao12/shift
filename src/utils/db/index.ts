import SQLiteConnection from "./sqlite.ts";

function createDbConnection(url: string, dbType: "sqlite") {
    switch (dbType) {
        case "sqlite":
            return new SQLiteConnection(url);
    }
}

export { createDbConnection };
