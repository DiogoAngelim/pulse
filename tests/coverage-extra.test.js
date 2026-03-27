

import test from "node:test";
import assert from "node:assert/strict";
import { createMySqlConnector } from "../packages/connectors/dist/mysql.js";
import { ObjectStorageConnector } from "../packages/connectors/dist/object-storage.js";
import { GenericSqlConnector } from "../packages/connectors/dist/sql-common.js";

// Mocks for SqlExecutor and context (pure JS)
const mockExecutor = {
  validateConnection: async () => {},
  inspectSchema: async () => ({ schemas: [], tables: [], views: [] }),
  estimateSize: async () => 42,
  streamRows: async function* () {
    yield { rows: [{ a: 1 }], schemaDefinition: undefined };
  }
};

const mockContext = {
  dataSource: {
    accessMode: "read_only",
    allowedViews: ["v"],
    allowedTables: ["t"],
    allowedSchemas: ["s"],
  },
  connectionConfig: {},
};

const mockQuery = { kind: "view", identifier: "v" };

// mysql.ts
test("createMySqlConnector returns a GenericSqlConnector instance", () => {
  const conn = createMySqlConnector(mockExecutor);
  assert(conn instanceof GenericSqlConnector);
});

// object-storage.ts
test("ObjectStorageConnector.validateConnection returns valid", async () => {
  const c = new ObjectStorageConnector();
  const res = await c.validateConnection({});
  assert.deepEqual(res, { valid: true, warnings: [] });
});
test("ObjectStorageConnector.inspectSchema returns empty schema", async () => {
  const c = new ObjectStorageConnector();
  const res = await c.inspectSchema({});
  assert.deepEqual(res, { schemas: [], tables: [], views: [] });
});
test("ObjectStorageConnector.estimateSize returns 0", async () => {
  const c = new ObjectStorageConnector();
  const res = await c.estimateSize({}, {});
  assert.equal(res, 0);
});
test("ObjectStorageConnector.streamData yields empty rows", async () => {
  const c = new ObjectStorageConnector();
  const gen = c.streamData({}, {});
  const results = [];
  for await (const value of gen) {
    results.push(value);
  }
  assert.deepEqual(results, [{ rows: [] }]);
});

// sql-common.ts
test("GenericSqlConnector.validateConnection returns valid for read_only", async () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const res = await c.validateConnection(mockContext);
  assert.deepEqual(res, { valid: true, warnings: [] });
});
test("GenericSqlConnector.validateConnection returns invalid for non-read_only", async () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const ctx = { ...mockContext, dataSource: { ...mockContext.dataSource, accessMode: "write" } };
  const res = await c.validateConnection(ctx);
  assert.equal(res.valid, false);
});
test("GenericSqlConnector.estimateSize throws for not allowlisted view", () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const ctx = { ...mockContext, dataSource: { ...mockContext.dataSource, allowedViews: [] } };
  assert.throws(() => c.estimateSize(ctx, mockQuery));
});
test("GenericSqlConnector.estimateSize works for allowlisted view", async () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const res = await c.estimateSize(mockContext, mockQuery);
  assert.equal(res, 42);
});
test("GenericSqlConnector.streamData yields with derived schema", async () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const gen = c.streamData(mockContext, mockQuery);
  const { value, done } = await gen.next();
  assert.deepEqual(value, { rows: [{ a: 1 }], schemaDefinition: { fields: [{ name: "a", dataType: "number", nullable: true }] } });
  assert(!done);
});
test("GenericSqlConnector.extractSnapshot aggregates rows and schema", async () => {
  const c = new GenericSqlConnector("sql", mockExecutor);
  const res = await c.extractSnapshot(mockContext, mockQuery);
  assert.equal(res.rowCount, 1);
  assert(res.schemaDefinition.fields.length > 0);
  assert(typeof res.checksum === "string");
});
