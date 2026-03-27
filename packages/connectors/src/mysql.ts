import { GenericSqlConnector, type SqlExecutor } from "./sql-common.js";

export function createMySqlConnector(executor: SqlExecutor) {
  return new GenericSqlConnector("mysql", executor);
}

