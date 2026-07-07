export function planRemediation(input: { actionType: string; riskScore: number }) {
  const requiresApproval = input.riskScore > 0.3;

  return {
    actionType: input.actionType,
    requiresApproval,
    rollbackAvailable: input.actionType !== "delete_snapshot",
  };
}
