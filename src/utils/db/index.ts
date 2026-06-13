import SQLiteConnection from "./sqlite/connect.ts";

function createDbConnection(url: string, dbType: "sqlite") {
    switch (dbType) {
        case "sqlite":
            return new SQLiteConnection(url);
    }
}

export default createDbConnection;
