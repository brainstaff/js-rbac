import mongoose from 'mongoose';

import { RbacItem } from '@brainstaff/rbac';

const RbacItemSchema = new mongoose.Schema<RbacItem>({
  name: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'role',
      'rule',
      'perm',
    ]
  },
});

export default mongoose.model('RbacItem', RbacItemSchema, 'RbacItem');
