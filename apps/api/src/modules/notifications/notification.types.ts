export type Notification = {
  id: string;
  organizationId: string;
  userId: string | null;
  channel: "email" | "slack" | "in_app";
  title: string;
  body: string;
  status: "queued" | "sent" | "failed";
  createdAt: string;
};
