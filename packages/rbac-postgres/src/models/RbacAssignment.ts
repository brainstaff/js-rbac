import { Model } from 'objection';

import { RbacAssignment } from '@brainstaff/rbac';

import { ModelOf } from '../utils/model-of';

interface RbacAssignmentModel extends ModelOf<RbacAssignment> {}

class RbacAssignmentModel extends Model {
  static get tableName() {
    return 'rbac_assignments';
  }

  static get idColumn() {
    return ['userId', 'role', 'contextId'];
  }
}

export default RbacAssignmentModel;
