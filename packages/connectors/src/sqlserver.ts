import { GenericSqlConnector, type SqlExecutor } from "./sql-common.js";

export function createSqlServerConnector(executor: SqlExecutor) {
  return new GenericSqlConnector("sqlserver", executor);
}

