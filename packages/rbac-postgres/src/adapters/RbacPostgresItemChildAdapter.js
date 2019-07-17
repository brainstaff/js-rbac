import RbacItemChild from '../models/RbacItemChild';

class RbacPostgresItemChildAdapter {
  async store(rbacItemChildren) {
    await RbacItemChild.query().delete();
    const itemChildren = await RbacItemChild.query().insert(rbacItemChildren);
    return itemChildren.map(itemChild => itemChild.toJSON());
  }

  async load() {
    const itemChildren = await RbacItemChild.query();
    return itemChildren.map(itemChild => itemChild.toJSON());
  }

  async create(parent, child) {
    let itemChild = await RbacItemChild.query().findById([parent, child]);
    if (itemChild) {
      throw new Error(`Association of ${parent} and ${child} already exists.`);
    }

    itemChild = await RbacItemChild.query().insert({ parent, child });
    return itemChild && itemChild.toJSON();
  }

  async findByParent(parent) {
    const itemChildren = await RbacItemChild.query().where({ parent });
    return itemChildren.map(itemChild => itemChild.toJSON());
  }
}

export default RbacPostgresItemChildAdapter;
