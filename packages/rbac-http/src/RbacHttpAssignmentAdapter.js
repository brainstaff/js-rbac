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

  async findByUserId(userId) {
    return axios.get(`${this.config.baseUrl}/rbac/assignments/${userId}`, {
      headers: this.config.headers
    });
  }

  async delete(userId, role) {
    return axios.delete(`${this.config.baseUrl}/rbac/assignments/${userId}/${role}`, {
      headers: this.config.headers
    });
  }
}
