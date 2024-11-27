import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId } from '@brainstaff/rbac';

import RbacAssignmentModel from '../models/RbacAssignment';

export default class RbacMongodbAssignmentAdapter implements RbacAssignmentAdapter {
  async store(raw: RbacAssignment[]) {
    const all = raw.map(x => new RbacAssignment(x));
    await RbacAssignmentModel.deleteMany({});
    await RbacAssignmentModel.create(all);
  }

  async load() {
    const entries = await RbacAssignmentModel.find({});
    return entries.map(x => new RbacAssignment(x));
  }

  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    if (await RbacAssignmentModel.exists({ userId: one.userId, role: one.role })) {
      throw new Error(`Role ${one.role} is already assigned to user ${one.userId}.`);
    }
    await RbacAssignmentModel.create(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name']) {
    const entry = await RbacAssignmentModel.findOne({ userId, role });
    return entry == null ? null : new RbacAssignment(entry);
  }

  async findByUserId(userId: RbacUserId) {
    const entry = await RbacAssignmentModel.find({ userId });
    return entry.map(x => new RbacAssignment(x));
  }

  async delete(userId: RbacUserId, role: RbacItem['name']) {
    const entry = await RbacAssignmentModel.findOne({ userId, role });
    if (!entry) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
    await RbacAssignmentModel.findByIdAndDelete(entry._id);
  }

  async deleteByUser(userId: RbacUserId) {
    await RbacAssignmentModel.deleteMany({ userId });
  }
}
