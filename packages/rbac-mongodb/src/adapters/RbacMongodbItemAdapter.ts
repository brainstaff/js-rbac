import { RbacItem, RbacItemAdapter } from '@brainstaff/rbac';

import RbacItemModel from '../models/RbacItem';

export default class RbacMongodbItemAdapter implements RbacItemAdapter {
  async store(raw: RbacItem[]) {
    const all = raw.map(x => new RbacItem(x));
    await RbacItemModel.deleteMany({});
    await RbacItemModel.create(all);
  }

  async load() {
    const entries = await RbacItemModel.find({});
    return entries.map(x => new RbacItem(x));
  }

  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    if (await this.find(one.name)) {
      throw new Error(`Item ${one.name} already exists.`);
    }
    await RbacItemModel.create(one);
  }

  async find(name: RbacItem['name']) {
    const entry = await RbacItemModel.findOne({ name });
    return entry == null ? null : new RbacItem(entry);
  }

  async findByType(type: RbacItem['type']) {
    const entry = await RbacItemModel.find({ type });
    return entry.map(x => new RbacItem(x));
  }
}
