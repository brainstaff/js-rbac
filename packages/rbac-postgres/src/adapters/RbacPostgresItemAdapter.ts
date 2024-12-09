import {
  RbacItem,
  RbacItemAdapter,
  RbacItemAlreadyExistsError,
} from "@brainstaff/rbac";
import { Knex } from "knex";

import RbacItemModel from "../models/RbacItem";

class RbacPostgresItemAdapter implements RbacItemAdapter {
  constructor(deps: { client: Knex }) {
    RbacItemModel.knex(deps.client);
  }

  async store(raw: RbacItem[]) {
    const all = raw.map((x) => new RbacItem(x));
    await RbacItemModel.query().delete();
    await RbacItemModel.query().insert(all);
  }

  async load() {
    const entries = await RbacItemModel.query();
    return entries.map((x) => new RbacItem(x));
  }

  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    if (await this.find(one.name)) {
      throw new RbacItemAlreadyExistsError(one);
    }
    await RbacItemModel.query().insert(one);
  }

  async find(name: RbacItem["name"]) {
    const value = await RbacItemModel.query().findById([name]);
    return value == null ? null : new RbacItem(value);
  }

  async findByType(type: RbacItem["type"]) {
    const entries = await RbacItemModel.query().where({ type });
    return entries.map((x) => new RbacItem(x));
  }
}

export default RbacPostgresItemAdapter;
