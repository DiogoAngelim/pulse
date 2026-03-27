import type { TrainedModel } from "./trainer.js";

export function evaluateModelAccuracy(model: TrainedModel, labels: Array<number | string>): Record<string, number> {
  if (labels.length === 0) {
    return { accuracy: 0 };
  }

  const correct = labels.filter((label) => label === model.majorityLabel).length;
  return {
    accuracy: correct / labels.length
  };
}

