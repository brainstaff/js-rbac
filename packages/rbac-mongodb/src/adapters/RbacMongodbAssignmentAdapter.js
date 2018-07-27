import RbacAssignment from '../models/RbacAssignment';

export default class RbacMongodbAssignmentAdapter {
  constructor() {
  }

  async store(rbacAssignments) {
    await RbacAssignment.remove({});
    return await RbacAssignment.create(rbacAssignments);
  }

  async load() {
    return await RbacAssignment.find({});
  }

  async create(userId, role) {
    const currentRole = await RbacAssignment.findOne({ userId: userId, role: role });
    if (currentRole) {
      throw new Error(`Role ${role} is already assigned to user ${userId}.`);
    }

    return await RbacAssignment.create({ userId: userId, role: role });
  }

  async find(userId, role) {
    return await RbacAssignment.findOne({ userId: userId, role: role });
  }

  async findByUserId(userId) {
    return await RbacAssignment.find({ userId: userId });
  }

  async delete(userId, role) {
    const currentRole = await RbacAssignment.findOne({ userId: userId, role: role });

    if (!currentRole) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }

    return await RbacAssignment.findByIdAndRemove(currentRole._id);
  }

  async deleteByUser(userId) {
    return await RbacAssignment.remove({ userId });
  }
}
