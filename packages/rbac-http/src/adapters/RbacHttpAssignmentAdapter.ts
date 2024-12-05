import {
  defaultRbacContextId,
  RbacAssignment,
  RbacAssignmentAdapter,
  RbacItem,
  RbacUserId,
} from "@brainstaff/rbac";
import { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export default class RbacHttpAssignmentAdapter
  implements RbacAssignmentAdapter
{
  private client: AxiosInstance;

  constructor(deps: { client: AxiosInstance }) {
    this.client = deps.client;
  }

  @rethrow
  async store(raw: RbacAssignment[]) {
    const all = raw.map((x) => new RbacAssignment(x));
    await this.client.post(`/rbac/assignments`, { rbacAssignments: all });
  }

  @rethrow
  async load(contextId = defaultRbacContextId) {
    const res = await this.client.get(`/rbac/assignments`, {
      params: { contextId },
    });
    return res.data.map((x: any) => new RbacAssignment(x));
  }

  @rethrow
  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    await this.client.post(`/rbac/assignments`, one);
  }

  @rethrow
  async find(
    userId: RbacUserId,
    role: RbacItem["name"],
    contextId = defaultRbacContextId,
  ) {
    const res = await this.client.get(`/rbac/assignments/${userId}/${role}`, {
      params: { contextId },
    });
    return res.data == null ? null : new RbacAssignment(res.data);
  }

  @rethrow
  async findByUserId(userId: RbacUserId, contextId = defaultRbacContextId) {
    const res = await this.client.get(`/rbac/assignments/${userId}`, {
      params: { contextId },
    });
    return res.data.map((x: any) => new RbacAssignment(x));
  }

  @rethrow
  async delete(
    userId: RbacUserId,
    role: RbacItem["name"],
    contextId = defaultRbacContextId,
  ) {
    await this.client.delete(`/rbac/assignments/${userId}/${role}`, {
      params: { contextId },
    });
  }

  @rethrow
  async deleteByUser(userId: RbacUserId, contextId = defaultRbacContextId) {
    await this.client.delete(`/rbac/assignments/${userId}`, {
      params: { contextId },
    });
  }
}
