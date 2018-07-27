import RbacItem from '../models/RbacItem';

export default class RbacMongodbItemAdapter {
  constructor() {
  }

  async store(rbacItems) {
    await RbacItem.remove({});
    return await RbacItem.create(rbacItems);
  }

  async load() {
    return await RbacItem.find({});
  }

  async create(name, type, rule) {
    const currentItem = await RbacItem.findOne({ name });
    if (currentItem) {
      throw new Error(`Item ${name} already exists.`);
    }

    return await RbacItem.create({ name, type, rule });
  }

  async find(name) {
    return await RbacItem.findOne({ name });
  }

  async findByType(type) {
    return await RbacItem.find({ type });
  }
}
