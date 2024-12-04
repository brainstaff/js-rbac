import { RbacItem, RbacItemAdapter, RbacItemAlreadyExistsError } from "@brainstaff/rbac";

export default class RbacInMemoryItemAdapter implements RbacItemAdapter {
  private entries: RbacItem[] = [];

  async store(raw: RbacItem[]) {
    const all = raw.map(x => new RbacItem(x));
    this.entries = all;
  }

  async load() {
    return this.entries;
  }

  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    if (await this.find(one.name)) {
      throw new RbacItemAlreadyExistsError(one);
    }
    this.entries.push(one);
  }

  async find(name: RbacItem['name']) {
    return this.entries.find(x => x.name === name) ?? null;
  }

  async findByType(type: RbacItem['type']) {
    return this.entries.filter(x => x.type === type);
  }
}
