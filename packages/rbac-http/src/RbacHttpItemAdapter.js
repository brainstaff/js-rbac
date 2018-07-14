import axios from "axios";

export default class RbacHttpItemAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacItems) {
    return axios.post(`${this.config.baseUrl}/rbac/items`, { rbacItems }, {
      headers: this.config.headers
    });
  }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/items`, {
      headers: this.config.headers
    });
  }

  async create(name, type, rule) {
    return axios.post(`${this.config.baseUrl}/rbac/items`, { name, type, rule }, {
      headers: this.config.headers
    });
  }

  async find(name) {
    return axios.get(`${this.config.baseUrl}/rbac/items/${name}`, {
      headers: this.config.headers
    });
  }
}
