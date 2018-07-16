import mongoose from 'mongoose';

const RbacItemSchema = mongoose.Schema({
  name: {
    type: String,
    unique: true
  },
  type: {
    type: String,
    enum: [
      'permission',
      'role'
    ]
  },
  rule: {
    type: String,
    ref: 'RbacRule'
  }
});

export default mongoose.model('RbacItem', RbacItemSchema, 'RbacItem');
