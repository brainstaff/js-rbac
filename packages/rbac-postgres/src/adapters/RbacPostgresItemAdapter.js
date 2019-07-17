import RbacItem from '../models/RbacItem';

class RbacPostgresItemAdapter {
  async store(rbacItems) {
    await RbacItem.query().delete();
    const items = await RbacItem.query().insert(rbacItems);
    return items.map(assignment => assignment.toJSON());
  }

  async load() {
    const items = await RbacItem.query();
    return items.map(assignment => assignment.toJSON());
  }

  async create(name, type, rule) {
    let item = await RbacItem.query().findOne({ name });
    if (item) {
      throw new Error(`Item ${name} already exists.`);
    }

    item = await RbacItem.query().insert({ name, type, rule });
    return item && item.toJSON();
  }

  async find(name) {
    const item = await RbacItem.query().findById(name);
    return item && item.toJSON();
  }

  async findByType(type) {
    const items = await RbacItem.query().where({ type });
    return items.map(item => item.toJSON());
  }
}

export default RbacPostgresItemAdapter;
