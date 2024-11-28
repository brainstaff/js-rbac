import { Knex } from 'knex';

import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacUserId } from '@brainstaff/rbac';

import RbacAssignmentModel from '../models/RbacAssignment';

export default class RbacPostgresAssignmentAdapter<RbacContextId = never> implements RbacAssignmentAdapter<RbacContextId> {
  constructor(deps: {
    client: Knex
  }) {
    RbacAssignmentModel.knex(deps.client);
  }

  async store(raw: RbacAssignment<RbacContextId>[]) {
    const all = raw.map(x => new RbacAssignment(x));
    await RbacAssignmentModel.query().delete();
    await RbacAssignmentModel.query().insert(all);
  }

  async load() {
    const entries = await RbacAssignmentModel.query() as RbacAssignment<RbacContextId>[];
    return entries.map(x => new RbacAssignment(x));
  }

  async create(raw: RbacAssignment<RbacContextId>) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role)) {
      throw new Error(`Role ${one.role} is already assigned to user ${one.userId}.`);
    }
    await RbacAssignmentModel.query().insert(one);
  }

  async find(userId: RbacUserId, role: RbacItem['name']) {
    const entry = await RbacAssignmentModel.query().findById([userId, role]) as RbacAssignment<RbacContextId>;
    return entry == null ? null : new RbacAssignment(entry);
  }

  async findByUserId(userId: RbacUserId) {
    const entries = await RbacAssignmentModel.query().where({ userId }) as RbacAssignment<RbacContextId>[];
    return entries.map(x => new RbacAssignment(x));
  }

  async delete(userId: RbacUserId, role: RbacItem['name']) {
    const entry = await RbacAssignmentModel.query().findById([userId, role]);
    if (!entry) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
    await RbacAssignmentModel.query().deleteById([userId, role]);
  }

  async deleteByUser(userId: RbacUserId) {
    const entry = await RbacAssignmentModel.query().where({ userId });
    await RbacAssignmentModel.query().where({ userId }).delete();
  }
}
