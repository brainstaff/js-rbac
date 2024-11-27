import { Knex } from 'knex';

import { RbacItem, RbacItemAdapter } from '@brainstaff/rbac';

import RbacItemModel from '../models/RbacItem';
import { toRbacItem } from '../utils/mappers';

export default class RbacPostgresItemAdapter implements RbacItemAdapter {
  constructor(deps: {
    client: Knex
  }) {
    RbacItemModel.knex(deps.client);
  }

  async store(raw: RbacItem[]) {
    const all = raw.map(x => new RbacItem(x));
    await RbacItemModel.query().delete();
    await RbacItemModel.query().insert(all);
  }

  async load() {
    const entries = await RbacItemModel.query();
    return entries.map(toRbacItem);
  }

  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    if (await RbacItemModel.query().findOne({ name: one.name })) {
      throw new Error(`Item ${one.name} already exists.`);
    }
    await RbacItemModel.query().insert(one);
  }

  async find(name: RbacItem['name']) {
    const value = await RbacItemModel.query().findById([name]);
    return value == null ? null : toRbacItem(value);
  }

  async findByType(type: RbacItem['type']) {
    const entries = await RbacItemModel.query().where({ type });
    return entries.map(toRbacItem);
  }
}
