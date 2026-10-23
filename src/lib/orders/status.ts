export type CanonicalOrderStatus =
  | "ORDER_RECEIVED"
  | "KUNDLI_IN_PROGRESS"
  | "KUNDLI_COMPLETE"
  | "DISPATCHED"
  | "DELIVERED"
  | "EXECUTION_COMPLETE";

export const ORDER_STATUS_ORDER: CanonicalOrderStatus[] = [
  "ORDER_RECEIVED",
  "KUNDLI_IN_PROGRESS",
  "KUNDLI_COMPLETE",
  "DISPATCHED",
  "DELIVERED",
  "EXECUTION_COMPLETE",
];

export interface StatusTransitionRule {
  from: CanonicalOrderStatus;
  allowedNext: CanonicalOrderStatus[];
}

/**
 * Validates whether an order can transition from current to next status.
 * Pure digital orders (no physical pothi dispatch) can transition directly
 * from KUNDLI_COMPLETE to EXECUTION_COMPLETE.
 */
export function isValidStatusTransition(
  current: CanonicalOrderStatus,
  next: CanonicalOrderStatus,
  isDigitalOnly = false
): boolean {
  if (current === next) return true;

  const validTransitions: Record<CanonicalOrderStatus, CanonicalOrderStatus[]> = {
    ORDER_RECEIVED: ["KUNDLI_IN_PROGRESS"],
    KUNDLI_IN_PROGRESS: ["KUNDLI_COMPLETE"],
    KUNDLI_COMPLETE: isDigitalOnly
      ? ["EXECUTION_COMPLETE", "DISPATCHED"]
      : ["DISPATCHED"],
    DISPATCHED: ["DELIVERED"],
    DELIVERED: ["EXECUTION_COMPLETE"],
    EXECUTION_COMPLETE: [],
  };

  const allowed = validTransitions[current] || [];
  return allowed.includes(next);
}

/**
 * Returns progress percentage (0 - 100) and step index (1 - 6) for stepper UI
 */
export function getStatusProgress(status: CanonicalOrderStatus): {
  step: number;
  totalSteps: number;
  progressPercent: number;
} {
  const index = ORDER_STATUS_ORDER.indexOf(status);
  const step = index >= 0 ? index + 1 : 1;
  const totalSteps = ORDER_STATUS_ORDER.length;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return { step, totalSteps, progressPercent };
}
