import { Kysely, PostgresDialect } from "kysely";
import { DB } from "./dbTypes";
import { Pool } from "pg";

export const createDb = (connectionString: string) =>
    new Kysely<DB>({
        dialect: new PostgresDialect({
            pool: new Pool({
                connectionString,
            }),
        })
    });
