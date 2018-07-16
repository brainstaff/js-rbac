import mongoose from 'mongoose';

const RbacItemChildSchema = mongoose.Schema({
  parent: {
    type: String,
    ref: 'RbacItem'
  },
  child: {
    type: String,
    ref: 'RbacItem'
  }
});

export default mongoose.model('RbacItemChild', RbacItemChildSchema, 'RbacItemChild');
