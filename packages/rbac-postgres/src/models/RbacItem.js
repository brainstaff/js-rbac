import { Model } from 'objection';

class RbacItem extends Model {
  static get tableName() {
    return 'rbac_items';
  }

  static get idColumn() {
    return 'name';
  }
}

export default RbacItem;
