const { Model } = require('objection');

class RbacItemChild extends Model {
  static get tableName() {
    return 'rbac_item_children';
  }

  static get idColumn() {
    return ['parent', 'child'];
  }
}

module.exports = RbacItemChild;
