import axios from "axios";

export default class RbacHttpRuleAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacRules) {
    try {
      return axios.post(`${this.config.baseUrl}/rbac/rules`, { rbacRules }, {
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
      return axios.get(`${this.config.baseUrl}/rbac/rules`, {
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

  async create(name) {
    try {
      return await axios.post(`${this.config.baseUrl}/rbac/rules`, { name }, {
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
