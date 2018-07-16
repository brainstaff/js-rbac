export default class RbacInMemoryItemChildAdapter {
  constructor() {
    this.rbacItemChildren = [];
  }

  async store(rbacItemChildren) {
    this.rbacItemChildren = rbacItemChildren;
  }

  async load() {
    return this.rbacItemChildren;
  }

  async create(parent, child) {
    if (this.rbacItemChildren.find(itemChild => itemChild.parent === parent && itemChild.child === child)) {
      throw new Error(`Association of ${parent} and ${child} already exists.`);
    }
    this.rbacItemChildren.push({ parent, child });
  }

  async findByParent(parent) {
    return this.rbacItemChildren.filter(rbacItemChild => rbacItemChild.parent === parent);
  }
}
