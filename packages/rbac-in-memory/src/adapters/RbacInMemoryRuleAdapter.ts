import { RbacRule, RbacRuleAdapter } from "@brainstaff/rbac";

export default class RbacInMemoryRuleAdapter implements RbacRuleAdapter {
  private entries: RbacRule[] = [];

  async store(raw: RbacRule[]) {
    const all = raw.map(x => new RbacRule(x));
    this.entries = all;
  }

  async load() {
    return this.entries;
  }

  async create(raw: RbacRule) {
    const one = new RbacRule(raw);
    if (this.entries.find(x => x.name === one.name)) {
      throw new Error(`Rule ${one.name} already exists.`);
    }
    this.entries.push(one);
  }

  async find(name: RbacRule['name']) {
    return this.entries.find(x => x.name === name) ?? null;
  }
}
