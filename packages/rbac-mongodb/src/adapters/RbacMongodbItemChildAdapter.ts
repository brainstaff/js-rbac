import { RbacItemChildAdapter } from '@brainstaff/rbac/src/rbac-adapter';
import { RbacItem, RbacItemChild } from '@brainstaff/rbac';

import RbacItemChildModel from '../models/RbacItemChild';

export default class RbacMongodbItemChildAdapter implements RbacItemChildAdapter {
  async store(raw: RbacItemChild[]) {
    const all = raw.map(x => new RbacItemChild(x));
    await RbacItemChildModel.deleteMany({});
    await RbacItemChildModel.create(all);
  }

  async load() {
    const entries = await RbacItemChildModel.find({});
    return entries.map(x => new RbacItemChild(x));
  }

  async create(raw: RbacItemChild) {
    const one = new RbacItemChild(raw);
    if (await RbacItemChildModel.exists({ parent: one.parent, child: one.child })) {
      throw new Error(`Association of ${one.parent} and ${one.child} already exists.`);
    }
    await RbacItemChildModel.create(one);
  }

  async find(parent: RbacItem['name'], child: RbacItem['name']) {
    const entry = await RbacItemChildModel.findOne({ parent, child });
    return entry == null ? null : new RbacItemChild(entry);
  }

  async findByParent(parent: RbacItem['name']) {
    const entries = await RbacItemChildModel.find({parent});
    return entries.map(x => new RbacItemChild(x));
  }
}
