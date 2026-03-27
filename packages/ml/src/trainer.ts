import { hashValue } from "@pulse/shared";

import type { FeatureSet } from "./features.js";

export interface TrainedModel {
  algorithm: "majority_classifier";
  majorityLabel: number | string;
  featureNames: string[];
  checksum: string;
}

export function trainBaselineModel(featureSet: FeatureSet): TrainedModel {
  const counts = new Map<number | string, number>();
  for (const label of featureSet.labels) {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  const majorityLabel = [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 0;
  const model = {
    algorithm: "majority_classifier" as const,
    majorityLabel,
    featureNames: featureSet.featureNames,
    checksum: ""
  };

  model.checksum = hashValue(model);
  return model;
}

export function runModelPrediction(model: TrainedModel, input: Record<string, unknown>): Record<string, unknown> {
  return {
    prediction: model.majorityLabel,
    acceptedFeatures: model.featureNames.filter((field) => field in input)
  };
}

