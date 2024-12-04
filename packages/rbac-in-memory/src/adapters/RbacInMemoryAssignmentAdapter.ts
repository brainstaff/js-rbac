import { defaultRbacAssignmentContextId, RbacAssignmentNotFoundError, RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId, RbacAssignmentAlreadyExistsError } from "@brainstaff/rbac";

export default class RbacInMemoryAssignmentAdapter implements RbacAssignmentAdapter {
  private entries: RbacAssignment[] = [];

  async store(raw: RbacAssignment[]) {
    const all = raw.map((x) => new RbacAssignment(x));
    this.entries = all;
  }

  async load(contextId = defaultRbacAssignmentContextId) {
    return this.entries.filter(x => x.contextId === contextId);
  }

  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role, one.contextId)) {
      throw new RbacAssignmentAlreadyExistsError(one);
    }
    this.entries.push(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacAssignmentContextId) {
    return this.entries.find(x => x.userId === userId && x.role === role && x.contextId === contextId) ?? null;
  }

  async findByUserId(userId: RbacUserId, contextId = defaultRbacAssignmentContextId) {
    return this.entries.filter(x => x.userId === userId && x.contextId === contextId);
  }

  async delete(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacAssignmentContextId) {
    const idx = this.entries.findIndex(x => x.userId === userId && x.role === role && x.contextId === contextId);
    if (idx === -1) {
      throw new RbacAssignmentNotFoundError({ userId, role, contextId });
    }
    this.entries.splice(idx, 1);
  }

  async deleteByUser(userId: RbacUserId, contextId = defaultRbacAssignmentContextId) {
    this.entries = this.entries.filter(x => x.userId !== userId && x.contextId === contextId);
  }
}
