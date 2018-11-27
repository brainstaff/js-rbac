import { Model } from 'objection';

class RbacAssignment extends Model {
  static get tableName() {
    return 'rbac_assignments';
  }

  static get idColumn() {
    return ['userId', 'role'];
  }
}

export default RbacAssignment;
