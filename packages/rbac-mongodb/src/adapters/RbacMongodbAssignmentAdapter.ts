import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId } from '@brainstaff/rbac';

import RbacAssignmentModel from '../models/RbacAssignment';

export default class RbacMongodbAssignmentAdapter<RbacContextId = never> implements RbacAssignmentAdapter<RbacContextId> {
  async store(raw: RbacAssignment<RbacContextId>[]) {
    const all = raw.map(x => new RbacAssignment(x));
    await RbacAssignmentModel.deleteMany({});
    await RbacAssignmentModel.create(all);
  }

  async load() {
    const entries = await RbacAssignmentModel.find({}) as RbacAssignment<RbacContextId>[];
    return entries.map(x => new RbacAssignment(x));
  }

  async create(raw: RbacAssignment<RbacContextId>) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role)) {
      throw new Error(`Role ${one.role} is already assigned to user ${one.userId}.`);
    }
    await RbacAssignmentModel.create(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name']) {
    const entry = await RbacAssignmentModel.findOne({ userId, role }) as RbacAssignment<RbacContextId>;
    return entry == null ? null : new RbacAssignment(entry);
  }

  async findByUserId(userId: RbacUserId) {
    const entry = await RbacAssignmentModel.find({ userId }) as RbacAssignment<RbacContextId>[];
    return entry.map(x => new RbacAssignment(x));
  }

  async delete(userId: RbacUserId, role: RbacItem['name'], contextId?: RbacContextId) {
    const entry = await RbacAssignmentModel.findOne({ userId, role });
    if (!entry) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
    await RbacAssignmentModel.findByIdAndDelete(entry._id);
  }

  async deleteByUser(userId: RbacUserId, contextId?: RbacContextId) {
    await RbacAssignmentModel.deleteMany({ userId });
  }
}
