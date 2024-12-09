import {
  RbacItem,
  RbacItemChild,
  RbacItemChildAlreadyExistsError,
} from "@brainstaff/rbac";
import { RbacItemChildAdapter } from "@brainstaff/rbac/src/rbac-adapter";

import RbacItemChildModel from "../models/RbacItemChild";

class RbacMongodbItemChildAdapter implements RbacItemChildAdapter {
  async store(raw: RbacItemChild[]) {
    const all = raw.map((x) => new RbacItemChild(x));
    await RbacItemChildModel.deleteMany({});
    await RbacItemChildModel.create(all);
  }

  async load() {
    const entries = await RbacItemChildModel.find({});
    return entries.map((x) => new RbacItemChild(x));
  }

  async create(raw: RbacItemChild) {
    const one = new RbacItemChild(raw);
    if (await this.find(one.parent, one.child)) {
      throw new RbacItemChildAlreadyExistsError(one);
    }
    await RbacItemChildModel.create(one);
  }

  async find(parent: RbacItem["name"], child: RbacItem["name"]) {
    const entry = await RbacItemChildModel.findOne({ parent, child });
    return entry == null ? null : new RbacItemChild(entry);
  }

  async findByParent(parent: RbacItem["name"]) {
    const entries = await RbacItemChildModel.find({ parent });
    return entries.map((x) => new RbacItemChild(x));
  }
}

export default RbacMongodbItemChildAdapter;
