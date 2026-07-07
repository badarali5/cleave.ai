export function generateRecommendationDemo() {
  return [
    {
      id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      resourceId: "cccccccc-cccc-cccc-cccc-cccccccccccc",
      category: "idle_ec2",
      title: "Idle EC2 instance: staging-instance",
      explanation: "The instance has sustained low CPU and network activity over the observation window.",
      estimatedMonthlySavings: 74.19,
      confidenceScore: 0.91,
      riskScore: 0.18,
      status: "open",
      createdAt: new Date().toISOString(),
    },
    {
      id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
      organizationId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      resourceId: "dddddddd-dddd-dddd-dddd-dddddddddddd",
      category: "unattached_ebs",
      title: "Unattached EBS volume: orphaned-volume",
      explanation: "The volume is not attached to any instance and can be cleaned up after snapshot review.",
      estimatedMonthlySavings: 22.5,
      confidenceScore: 0.97,
      riskScore: 0.14,
      status: "open",
      createdAt: new Date().toISOString(),
    },
  ];
}
