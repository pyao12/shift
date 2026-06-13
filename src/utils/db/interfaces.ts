interface IDatabase {
    demo: () => void;
    execute: (sql: string) => void;
    create: (
        tableName: string,
        columns: { name: string; type: string }[],
    ) => void;
    insert: (tableName: string, data: Record<string, unknown>) => void;
    select: (
        tableName: string,
        options?: {
            columns?: string[];
            where?: string;
            params?: unknown[];
            orderBy?: string;
            limit?: number;
            offset?: number;
        },
    ) => unknown[];
    delete: (tableName: string, where?: string, params?: unknown[]) => void;
}

export default IDatabase;
