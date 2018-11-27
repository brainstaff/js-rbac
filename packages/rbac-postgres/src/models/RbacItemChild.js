import { Model } from 'objection';

class RbacItemChild extends Model {
  static get tableName() {
    return 'rbac_item_children';
  }

  static get idColumn() {
    return ['parent', 'child'];
  }
}

export default RbacItemChild;
