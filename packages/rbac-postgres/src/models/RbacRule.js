const { Model } = require('objection');

class RbacRule extends Model {
  static get tableName() {
    return 'rbac_rules';
  }

  static get idColumn() {
    return 'name';
  }
}

module.exports = RbacRule;
