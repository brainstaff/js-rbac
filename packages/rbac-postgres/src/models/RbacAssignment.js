const { Model } = require('objection');

class RbacAssignment extends Model {
  static get tableName() {
    return 'rbac_assignments';
  }

  static get idColumn() {
    return ['userId', 'role'];
  }
}

module.exports = RbacAssignment;
