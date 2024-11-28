import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId } from "@brainstaff/rbac";

export default class RbacInMemoryAssignmentAdapter<RbacContextId = never> implements RbacAssignmentAdapter<RbacContextId> {
  private entries: RbacAssignment<RbacContextId>[] = [];

  async store(raw: RbacAssignment<RbacContextId>[]) {
    const all = raw.map((x) => new RbacAssignment(x));
    this.entries = all;
  }

  async load() {
    return this.entries;
  }

  async create(raw: RbacAssignment<RbacContextId>) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role)) {
      throw new Error(`Role ${one.role} is already assigned to user ${one.userId}.`);
    }
    this.entries.push(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name']) {
    return this.entries.find(x => x.userId === userId && x.role === role) ?? null;
  }

  async findByUserId(userId: RbacUserId) {
    return this.entries.filter(x => x.userId === userId);
  }

  async delete(userId: RbacUserId, role: RbacItem['name']) {
    const idx = this.entries.findIndex(x => x.userId === userId && x.role === role);
    if (idx === -1) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
    this.entries.splice(idx, 1);
  }

  async deleteByUser(userId: RbacUserId) {
    this.entries = this.entries.filter(x => x.userId !== userId);
  }
}
