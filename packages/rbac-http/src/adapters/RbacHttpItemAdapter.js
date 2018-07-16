import axios from "axios";

export default class RbacHttpItemAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacItems) {
    try {
      return axios.post(`${this.config.baseUrl}/rbac/items`, { rbacItems }, {
        headers: this.config.headers
      });
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error.");
      }
    }
  }

  async load() {
    try {
      return axios.get(`${this.config.baseUrl}/rbac/items`, {
        headers: this.config.headers
      });
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error.");
      }
    }
  }

  async create(name, type, rule) {
    try {
      return await axios.post(`${this.config.baseUrl}/rbac/items`, { name, type, rule }, {
        headers: this.config.headers
      });
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error.");
      }
    }
  }

  async find(name) {
    try {
      return axios.get(`${this.config.baseUrl}/rbac/items/${name}`, {
        headers: this.config.headers
      });
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error.");
      }
    }
  }
}
