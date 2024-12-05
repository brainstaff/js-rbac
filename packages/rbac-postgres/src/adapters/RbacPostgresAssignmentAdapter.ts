import {
  defaultRbacContextId,
  RbacAssignment,
  RbacAssignmentAdapter,
  RbacAssignmentAlreadyExistsError,
  RbacAssignmentNotFoundError,
  RbacItem,
  RbacUserId,
} from "@brainstaff/rbac";
import { Knex } from "knex";

import RbacAssignmentModel from "../models/RbacAssignment";

export default class RbacPostgresAssignmentAdapter
  implements RbacAssignmentAdapter
{
  constructor(deps: { client: Knex }) {
    RbacAssignmentModel.knex(deps.client);
  }

  async store(raw: RbacAssignment[]) {
    const all = raw.map((x) => new RbacAssignment(x));
    await RbacAssignmentModel.query().delete();
    await RbacAssignmentModel.query().insert(all);
  }

  async load(contextId = defaultRbacContextId) {
    const entries = await RbacAssignmentModel.query().where({ contextId });
    return entries.map((x) => new RbacAssignment(x));
  }

  async create(raw: RbacAssignment) {
    const one = new RbacAssignment(raw);
    if (await this.find(one.userId, one.role, one.contextId)) {
      throw new RbacAssignmentAlreadyExistsError(one);
    }
    await RbacAssignmentModel.query().insert(one);
  }

  async find(
    userId: RbacUserId,
    role: RbacItem["name"],
    contextId = defaultRbacContextId,
  ) {
    const entry = await RbacAssignmentModel.query().findById([
      userId,
      role,
      contextId,
    ]);
    return entry == null ? null : new RbacAssignment(entry);
  }

  async findByUserId(userId: RbacUserId, contextId = defaultRbacContextId) {
    const entries = await RbacAssignmentModel.query().where({
      userId,
      contextId,
    });
    return entries.map((x) => new RbacAssignment(x));
  }

  async delete(
    userId: RbacUserId,
    role: RbacItem["name"],
    contextId = defaultRbacContextId,
  ) {
    const entry = await this.find(userId, role, contextId);
    if (entry == null) {
      throw new RbacAssignmentNotFoundError({ userId, role, contextId });
    }
    await RbacAssignmentModel.query().deleteById([userId, role, contextId]);
  }

  async deleteByUser(userId: RbacUserId, contextId = defaultRbacContextId) {
    await RbacAssignmentModel.query().where({ userId, contextId }).delete();
  }
}
