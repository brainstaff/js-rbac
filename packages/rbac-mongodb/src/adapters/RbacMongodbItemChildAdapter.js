import RbacItemChild from '../models/RbacItemChild';

export default class RbacMongodbItemChildAdapter {
  constructor() {
  }

  async store(rbacItemChildren) {
    await RbacItemChild.remove({});
    return await RbacItemChild.create(rbacItemChildren);
  }

  async load() {
    return await RbacItemChild.find({});
  }

  async create(parent, child) {
    const currcentItemChild = await RbacItemChild.findOne({ parent: parent, child: child });
    if (currcentItemChild) {
      throw new Error(`Association of ${parent} and ${child} already exists.`);
    }

    return await RbacItemChild.create({ parent, child });
  }

  async findByParent(parent) {
    return await RbacItemChild.find({parent});
  }
}
