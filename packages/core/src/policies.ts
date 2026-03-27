export interface PromotionPolicyInput {
  candidateMetrics: Record<string, number>;
  baselineMetrics?: Record<string, number>;
  minimumAccuracy?: number;
}

export interface PromotionDecision {
  approved: boolean;
  reason: string;
}

export interface RetrainingSignals {
  driftDetected: boolean;
  performanceDegraded: boolean;
  newDataAvailable: boolean;
  feedbackVolume: number;
  scheduled: boolean;
}

export function evaluatePromotionPolicy(input: PromotionPolicyInput): PromotionDecision {
  const candidateAccuracy = input.candidateMetrics.accuracy ?? 0;
  const baselineAccuracy = input.baselineMetrics?.accuracy ?? 0;
  const minimumAccuracy = input.minimumAccuracy ?? 0.6;

  if (candidateAccuracy < minimumAccuracy) {
    return { approved: false, reason: `candidate accuracy ${candidateAccuracy} below floor ${minimumAccuracy}` };
  }

  if (input.baselineMetrics && candidateAccuracy < baselineAccuracy) {
    return { approved: false, reason: `candidate accuracy ${candidateAccuracy} below baseline ${baselineAccuracy}` };
  }

  return { approved: true, reason: "candidate satisfies promotion policy" };
}

export function evaluateRetrainingSignals(signals: RetrainingSignals): string[] {
  const reasons: string[] = [];

  if (signals.driftDetected) {
    reasons.push("drift_detected");
  }

  if (signals.performanceDegraded) {
    reasons.push("performance_degraded");
  }

  if (signals.newDataAvailable) {
    reasons.push("new_data_available");
  }

  if (signals.feedbackVolume >= 25) {
    reasons.push("feedback_volume");
  }

  if (signals.scheduled) {
    reasons.push("scheduled_policy");
  }

  return reasons;
}

