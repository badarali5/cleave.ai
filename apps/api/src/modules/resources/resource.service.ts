import type { InMemoryResourceRepository } from "./in-memory-resource.repository.js";

export class ResourceService {
  constructor(private readonly repository: InMemoryResourceRepository) {}

  list(organizationId: string) {
    return this.repository.list(organizationId);
  }
}
