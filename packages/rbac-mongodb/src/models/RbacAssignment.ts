import mongoose from 'mongoose';

import { RbacAssignment } from '@brainstaff/rbac';

const RbacAssignmentSchema = new mongoose.Schema<RbacAssignment<unknown>>({
  userId: {
    type: String
  },
  role: {
    type: String,
    ref: 'RbacItem'
  }
});

export default mongoose.model('RbacAssignment', RbacAssignmentSchema, 'RbacAssignment');
