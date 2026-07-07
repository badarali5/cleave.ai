import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { auditRoutes } from "./modules/audit/audit.routes.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { organizationRoutes } from "./modules/organizations/organization.routes.js";
import { awsRoutes } from "./modules/aws/aws.routes.js";
import { recommendationRoutes } from "./modules/recommendations/recommendation.routes.js";
import { notificationRoutes } from "./modules/notifications/notification.routes.js";
import { reportRoutes } from "./modules/reports/report.routes.js";
import { savingsRoutes } from "./modules/savings/savings.routes.js";
import { resourceRoutes } from "./modules/resources/resource.routes.js";
import { billingIngestionRoutes } from "./modules/billing-ingestion/billing-ingestion.routes.js";

export function buildApp() {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL ?? "info",
    },
  });

  app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.register(jwt, {
    secret: process.env.JWT_SECRET ?? "dev-only-secret-change-me",
  });

  app.register(authRoutes, { prefix: "/auth" });
  app.register(healthRoutes, { prefix: "/health" });
  app.register(organizationRoutes, { prefix: "/organizations" });
  app.register(awsRoutes, { prefix: "/connect/aws" });
  app.register(billingIngestionRoutes, { prefix: "/billing" });
  app.register(recommendationRoutes, { prefix: "/recommendations" });
  app.register(resourceRoutes, { prefix: "/resources" });
  app.register(reportRoutes, { prefix: "/reports" });
  app.register(savingsRoutes, { prefix: "/savings" });
  app.register(auditRoutes, { prefix: "/audit-logs" });
  app.register(notificationRoutes, { prefix: "/notifications" });

  return app;
}
