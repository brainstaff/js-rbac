import { AxiosInstance } from 'axios';

import { defaultRbacAssignmentContextId, RbacAssignment, RbacAssignmentAdapter, RbacAssignmnentContextId, RbacItem, RbacUserId } from '@brainstaff/rbac';

import { rethrow } from '../utils/rethrow';

export default class RbacHttpAssignmentAdapter implements RbacAssignmentAdapter {
  private client: AxiosInstance;

  constructor(deps: {
    client: AxiosInstance;
  }) {
    this.client = deps.client;
  }

  @rethrow
  async store(raw: RbacAssignment[]) {
    const all = raw.map(x => new RbacAssignment(x));
    await this.client.post(`/rbac/assignments`, { rbacAssignments: all });
  }

  @rethrow
  async load(contextId = defaultRbacAssignmentContextId) {
    const res = await this.client.get(`/rbac/assignments`, { params: { contextId } });
    return res.data.map((x: any) => new RbacAssignment(x));
  }

  @rethrow
  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    await this.client.post(`/rbac/assignments`, one);
  }

  @rethrow
  async find(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacAssignmentContextId) {
    const res = await this.client.get(`/rbac/assignments/${userId}/${role}`, { params: { contextId } });
    return res.data == null ? null : new RbacAssignment(res.data);
  }

  @rethrow
  async findByUserId(userId: RbacUserId, contextId = defaultRbacAssignmentContextId) {
    const res = await this.client.get(`/rbac/assignments/${userId}`, { params: { contextId } });
    return res.data.map((x: any) => new RbacAssignment(x));
  }

  @rethrow
  async delete(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacAssignmentContextId) {
    await this.client.delete(`/rbac/assignments/${userId}/${role}`, { params: { contextId } });
  }

  @rethrow
  async deleteByUser(userId: RbacUserId, contextId = defaultRbacAssignmentContextId) {
    await this.client.delete(`/rbac/assignments/${userId}`, { params: { contextId } });
  }
}
