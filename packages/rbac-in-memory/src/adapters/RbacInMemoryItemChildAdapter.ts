import { RbacItem, RbacItemChild, RbacItemChildAdapter, RbacItemChildAlreadyExistsError } from "@brainstaff/rbac";

export default class RbacInMemoryItemChildAdapter implements RbacItemChildAdapter {
  private entries: RbacItemChild[] = [];

  async store(raw: RbacItemChild[]) {
    const all = raw.map(x => new RbacItemChild(x));
    this.entries = all;
  }

  async load() {
    return this.entries;
  }

  async create(raw: RbacItemChild) {
    const one = new RbacItemChild(raw);
    if (await this.find(one.parent, one.child)) {
      throw new RbacItemChildAlreadyExistsError(one);
    }
    this.entries.push(one);
  }

  async find(parent: RbacItem['name'], child: RbacItem['name']) {
    return this.entries.find(x => x.parent === parent && x.child === child) ?? null;
  }

  async findByParent(parent: RbacItem['name']) {
    return this.entries.filter(x => x.parent === parent);
  }
}
