export class BillingService {
  previewInvoice(input: { organizationId: string; realizedSavings: number; successFeeRate?: number; currency?: string }) {
    const successFeeRate = input.successFeeRate ?? 0.2;
    const successFee = Number((input.realizedSavings * successFeeRate).toFixed(2));

    return {
      organizationId: input.organizationId,
      currency: input.currency ?? "USD",
      realizedSavings: Number(input.realizedSavings.toFixed(2)),
      successFeeRate,
      successFee,
      totalDue: successFee,
    };
  }

  handleStripeWebhook(input: { eventType: string; payload: Record<string, unknown> }) {
    return {
      accepted: true,
      eventType: input.eventType,
      receivedAt: new Date().toISOString(),
      payloadKeys: Object.keys(input.payload),
    };
  }
}
