import { defaultRbacContextId, RbacAssignmentNotFoundError, RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId, RbacAssignmentAlreadyExistsError } from '@brainstaff/rbac';

import RbacAssignmentModel from '../models/RbacAssignment';

export default class RbacMongodbAssignmentAdapter implements RbacAssignmentAdapter {
  async store(raw: RbacAssignment[]) {
    const all = raw.map(x => new RbacAssignment(x));
    await RbacAssignmentModel.deleteMany({});
    await RbacAssignmentModel.create(all);
  }

  async load(contextId = defaultRbacContextId) {
    const entries = await RbacAssignmentModel.find({ contextId });
    return entries.map(x => new RbacAssignment(x));
  }

  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role, one.contextId)) {
      throw new RbacAssignmentAlreadyExistsError(one);
    }
    await RbacAssignmentModel.create(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacContextId) {
    const entry = await RbacAssignmentModel.findOne({ userId, role, contextId });
    return entry == null ? null : new RbacAssignment(entry);
  }

  async findByUserId(userId: RbacUserId, contextId = defaultRbacContextId) {
    const entry = await RbacAssignmentModel.find({ userId, contextId });
    return entry.map(x => new RbacAssignment(x));
  }

  async delete(userId: RbacUserId, role: RbacItem['name'], contextId = defaultRbacContextId) {
    const entry = await this.find(userId, role, contextId);
    if (entry == null) {
      throw new RbacAssignmentNotFoundError({ userId, role, contextId });
    }
    await RbacAssignmentModel.deleteOne({userId, role, contextId});
  }

  async deleteByUser(userId: RbacUserId, contextId = defaultRbacContextId) {
    await RbacAssignmentModel.deleteMany({ userId, contextId });
  }
}
