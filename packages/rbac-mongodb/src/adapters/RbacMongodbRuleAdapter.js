import RbacRule from '../models/RbacRule';

export default class RbacMongodbRuleAdapter {
  constructor() {
  }

  async store(rbacRules) {
    await RbacRule.remove({});
    await RbacRule.create(rbacRules);
  }

  async load() {
    return await RbacRule.find({});
  }

  async create(name) {
    await RbacRule.create({ name });
  }
}
