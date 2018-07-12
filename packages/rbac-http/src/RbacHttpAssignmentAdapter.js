import axios from "axios";

export default class RbacHttpAssignmentAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacAssignments) {
    return axios.post(`${this.config.baseUrl}/rbac/assignments`, { rbacAssignments }, {
      headers: this.config.headers
    });
  }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/assignments`, {
      headers: this.config.headers
    });
  }

  async create(userId, role) {
    return axios.post(`${this.config.baseUrl}/rbac/assignments`, { userId, role }, {
      headers: this.config.headers
    });
  }

  async find(userId, role) {
    return axios.get(`${this.config.baseUrl}/rbac/assignments/${userId}/${role}`, {
      headers: this.config.headers
    });
  }
  //
  // async findByUserId(userId) {
  //   return this.rbacAssignments.filter(assignment => assignment.userId === userId);
  // }
  //
  // async delete(userId, role) {
  //   const assignmentIndex = this.rbacAssignments.findIndex(assignment => assignment.userId === userId && assignment.role === role);
  //   if (assignmentIndex !== -1) {
  //     this.rbacAssignments.splice(assignmentIndex, 1);
  //   } else {
  //     throw new Error(`No assignment between ${userId} and ${role} was found.`);
  //   }
  // }
}
