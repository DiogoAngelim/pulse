import { GenericSqlConnector, type SqlExecutor } from "./sql-common.js";

export function createPostgresConnector(executor: SqlExecutor) {
  return new GenericSqlConnector("postgres", executor);
}

