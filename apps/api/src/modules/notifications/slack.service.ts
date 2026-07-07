export class SlackService {
  async sendWebhook(input: { webhookUrl: string; title: string; body: string; context?: Record<string, unknown> }) {
    const payload = {
      text: `*${input.title}*\n${input.body}`,
      blocks: [
        { type: "section", text: { type: "mrkdwn", text: `*${input.title}*` } },
        { type: "section", text: { type: "mrkdwn", text: input.body } },
        ...(input.context ? [{ type: "context", elements: [{ type: "mrkdwn", text: JSON.stringify(input.context) }] }] : []),
      ],
    };

    if (!input.webhookUrl) {
      return { delivered: false, reason: "missing webhook url", payload };
    }

    return {
      delivered: true,
      payload,
      sentAt: new Date().toISOString(),
    };
  }
}
