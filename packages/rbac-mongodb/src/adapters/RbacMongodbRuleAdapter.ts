import { RbacRule, RbacRuleAdapter, RbacRuleAlreadyExistsError } from '@brainstaff/rbac';

import RbacRuleModel from '../models/RbacRule';

export default class RbacMongodbRuleAdapter implements RbacRuleAdapter {
  async store(raw: RbacRule[]) {
    const all = raw.map(x => new RbacRule(x));
    await RbacRuleModel.deleteMany({});
    await RbacRuleModel.create(all);
  }

  async load() {
    const entries = await RbacRuleModel.find({});
    return entries.map(x => new RbacRule(x));
  }

  async create(raw: RbacRule) {
    const one = new RbacRule(raw);
    if (await this.find(one.name)) {
      throw new RbacRuleAlreadyExistsError(one);
    }
    await RbacRuleModel.create(one);
  }

  async find(name: RbacRule['name']) {
    const entry = await RbacRuleModel.findOne({ name });
    return entry == null ? null : new RbacRule(entry);
  }
}
