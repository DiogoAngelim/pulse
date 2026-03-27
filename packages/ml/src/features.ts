import type { SchemaDefinition } from "@pulse/core";

export interface FeatureSet {
  rows: Array<Record<string, number>>;
  labels: Array<number | string>;
  featureNames: string[];
}

export function buildFeatureSet(
  rows: Array<Record<string, unknown>>,
  schemaDefinition: SchemaDefinition,
  labelField: string
): FeatureSet {
  const featureNames = schemaDefinition.fields
    .filter((field) => field.name !== labelField)
    .map((field) => field.name);

  return {
    rows: rows.map((row) =>
      featureNames.reduce<Record<string, number>>((accumulator, field) => {
        const value = row[field];
        accumulator[field] = typeof value === "number" ? value : Number(value ?? 0);
        return accumulator;
      }, {})
    ),
    labels: rows.map((row) => (row[labelField] as number | string) ?? 0),
    featureNames
  };
}

