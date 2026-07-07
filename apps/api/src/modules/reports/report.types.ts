export type Report = {
  id: string;
  organizationId: string;
  reportType: "executive" | "engineering" | "weekly" | "monthly";
  title: string;
  summary: string;
  fileUrl: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
};
