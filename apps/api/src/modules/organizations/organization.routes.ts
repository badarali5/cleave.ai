import type { FastifyPluginAsync } from "fastify";
import { InMemoryOrganizationRepository } from "./in-memory-organization.repository.js";
import { OrganizationService } from "./organization.service.js";

const service = new OrganizationService(new InMemoryOrganizationRepository());

export const organizationRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => ({ items: await service.listOrganizations() }));

  app.post("/", async (request, reply) => {
    const body = request.body as { name?: string; slug?: string };

    if (!body?.name || !body.slug) {
      return reply.status(400).send({ message: "name and slug are required" });
    }

    const organization = await service.createOrganization({
      name: body.name,
      slug: body.slug,
    });

    return reply.status(201).send(organization);
  });
};
