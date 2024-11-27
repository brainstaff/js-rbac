import { Knex } from 'knex';

import { RbacItem, RbacItemChild, RbacItemChildAdapter } from '@brainstaff/rbac';

import RbacItemChildModel from '../models/RbacItemChild';

export default class RbacPostgresItemChildAdapter implements RbacItemChildAdapter {
  constructor(deps: {
    client: Knex
  }) {
    RbacItemChildModel.knex(deps.client);
  }
  
  async store(raw: RbacItemChild[]) {
    const all = raw.map(x => new RbacItemChild(x));
    await RbacItemChildModel.query().delete();
    await RbacItemChildModel.query().insert(all);
  }

  async load() {
    const entries = await RbacItemChildModel.query();
    return entries.map(x => new RbacItemChild(x));
  }

  async create(raw: RbacItemChild) {
    const one = new RbacItemChild(raw);
    if (await RbacItemChildModel.query().findById([one.parent, one.child])) {
      throw new Error(`Association of ${one.parent} and ${one.child} already exists.`);
    }
    await RbacItemChildModel.query().insert(one);
  }

  async find(parent: RbacItem['name'], child: RbacItem['name']) {
    const value = await RbacItemChildModel.query().findById([parent, child]);
    return value == null ? null : new RbacItemChild(value);
  }

  async findByParent(parent: RbacItem['name']) {
    const entries = await RbacItemChildModel.query().where({ parent });
    return entries.map(x => new RbacItemChild(x));
  }
}
