export default class RbacInMemoryItemAdapter {
  constructor() {
    this.rbacItems = [];
  }

  async store(rbacItems) {
    this.rbacItems = rbacItems;
  }

  async load() {
    return this.rbacItems;
  }

  async create(name, type, rule) {
    if (this.rbacItems.find(item => item.name === name)) {
      throw new Error(`Item ${name} already exists.`);
    }
    this.rbacItems.push({ name, type, rule });
  }

  async find(name) {
    return this.rbacItems.find(rbacItem => rbacItem.name === name);
  }

  async findByType(type) {
    return this.rbacItems.filter(rbacItem => rbacItem.type === type);
  }
}
