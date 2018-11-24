const { Model } = require('objection');

class RbacItem extends Model {
  static get tableName() {
    return 'rbac_items';
  }

  static get idColumn() {
    return 'name';
  }
}

module.exports = RbacItem;
