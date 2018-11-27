import RbacAssignment from '../models/RbacAssignment';

class RbacPostgresAssignmentAdapter {
  async store(rbacAssignments) {
    await RbacAssignment.query().delete();
    const assignments = await RbacAssignment.query().insert(rbacAssignments);
    return assignments.map(assignment => assignment.toJSON());
  }

  async load() {
    const assignments = await RbacAssignment.query();
    return assignments.map(assignment => assignment.toJSON());
  }

  async create(userId, role) {
    let assignment = await RbacAssignment.query().findById([userId, role]);
    if (assignment) {
      throw new Error(`Role ${role} is already assigned to user ${userId}.`);
    }
    assignment = await RbacAssignment.query().insert({ userId: userId, role: role });
    return assignment && assignment.toJSON();
  }

  async find(userId, role) {
    const assignment = await RbacAssignment.query().findById([userId, role]);
    return assignment && assignment.toJSON();
  }

  async findByUserId(userId) {
    const assignments = await RbacAssignment.query().where({ userId });
    return assignments.map(assignment => assignment.toJSON());
  }

  async delete(userId, role) {
    const assignment = await RbacAssignment.query().findById([userId, role]);
    if (!assignment) {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
    await RbacAssignment.query().deleteById([userId, role]);
    return assignment.toJSON();
  }

  async deleteByUser(userId) {
    let assignments = await RbacAssignment.query().where({ userId });
    await RbacAssignment.query().where({ userId }).delete();
    assignments = assignments.map(assignment => assignment.toJSON());
    return assignments;
  }
}

export default RbacPostgresAssignmentAdapter;
