import {
  RbacRule,
  RbacRuleAdapter,
  RbacRuleAlreadyExistsError,
} from "@brainstaff/rbac";
import { Knex } from "knex";

import RbacRuleModel from "../models/RbacRule";

export default class RbacPostgresRuleAdapter implements RbacRuleAdapter {
  constructor(deps: { client: Knex }) {
    RbacRuleModel.knex(deps.client);
  }

  async store(raw: RbacRule[]) {
    const all = raw.map((x) => new RbacRule(x));
    await RbacRuleModel.query().delete();
    await RbacRuleModel.query().insert(all);
  }

  async load() {
    const entries = await RbacRuleModel.query();
    return entries.map((x) => new RbacRule(x));
  }

  async create(raw: RbacRule) {
    const one = new RbacRule(raw);
    if (await this.find(one.name)) {
      throw new RbacRuleAlreadyExistsError(one);
    }
    await RbacRuleModel.query().insert(one);
  }

  async find(name: RbacRule["name"]) {
    const entry = await RbacRuleModel.query().findById([name]);
    return entry == null ? null : new RbacRule(entry);
  }
}
