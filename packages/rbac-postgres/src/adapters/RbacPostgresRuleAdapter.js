import RbacRule from '../models/RbacRule';

class RbacPostgresRuleAdapter {
  async store(rbacRules) {
    await RbacRule.query().delete();
    const rules = await RbacRule.query().insert(rbacRules);
    return rules.map(rule => rule.toJSON());
  }

  async load() {
    const rules = await RbacRule.query();
    return rules.map(rule => rule.toJSON());
  }

  async create(name) {
    let rule = await RbacRule.query().findById(name);
    if (rule) {
      throw new Error(`Rule ${name} already exists.`);
    }
    rule = await RbacRule.query().insert({ name });
    return rule && rule.toJSON();
  }
}

export default RbacPostgresRuleAdapter;
