import type { FeatureSet } from "./features.js";

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function detectFeatureDrift(reference: FeatureSet, candidate: FeatureSet): { score: number; featureDiffs: Record<string, number> } {
  const featureDiffs: Record<string, number> = {};

  for (const featureName of reference.featureNames) {
    const left = average(reference.rows.map((row) => row[featureName] ?? 0));
    const right = average(candidate.rows.map((row) => row[featureName] ?? 0));
    featureDiffs[featureName] = Math.abs(left - right);
  }

  const score = Object.values(featureDiffs).reduce((sum, value) => sum + value, 0);
  return { score, featureDiffs };
}

