import {
  defaultRbacContextId,
  RbacAssignment,
  RbacAssignmentAdapter,
  RbacItem,
  RbacUserId,
} from "@brainstaff/rbac";
import axios, { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export const assignmentsUrl = "/rbac-assignments";

class RbacHttpAssignmentAdapter implements RbacAssignmentAdapter {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  @rethrow
  async store(raw: RbacAssignment[]) {
    const all = raw.map((x) => new RbacAssignment(x));
    await this.client.post(assignmentsUrl, { rbacAssignments: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(assignmentsUrl);
    return res.data.map((x: any) => new RbacAssignment(x));
  }

  @rethrow
  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    await this.client.post(assignmentsUrl, one);
  }

  @rethrow
  async find(
    userId: RbacUserId,
    role: RbacItem["name"],
    contextId = defaultRbacContextId,
  ) {
    const res = await this.client.get(`${assignmentsUrl}/${userId}/${role}`, {
      params: { contextId },
    });
    return res.data == null ? null : new RbacAssignment(res.data);
  }

  @rethrow
  async findByUserId(userId: RbacUserId, contextId = defaultRbacContextId) {
    const res = await this.client.get(`${assignmentsUrl}/${userId}`, {
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
    await this.client.delete(`${assignmentsUrl}/${userId}/${role}`, {
      params: { contextId },
    });
  }

  @rethrow
  async deleteByUser(userId: RbacUserId, contextId = defaultRbacContextId) {
    await this.client.delete(`${assignmentsUrl}/${userId}`, {
      params: { contextId },
    });
  }
}

export default RbacHttpAssignmentAdapter;
