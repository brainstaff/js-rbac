import { Model } from 'objection';

class RbacRule extends Model {
  static get tableName() {
    return 'rbac_rules';
  }

  static get idColumn() {
    return 'name';
  }
}

export default RbacRule;
