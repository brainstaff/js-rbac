import mongoose from 'mongoose';

import { RbacAssignment } from '@brainstaff/rbac';

const RbacAssignmentSchema = new mongoose.Schema<RbacAssignment>({
  userId: {
    type: String
  },
  role: {
    type: String,
    ref: 'RbacItem'
  },
  contextId: {
    type: String
  }
});

export default mongoose.model('RbacAssignment', RbacAssignmentSchema, 'RbacAssignment');
