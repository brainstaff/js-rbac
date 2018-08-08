import axios from "axios";

export default class RbacHttpRuleAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacRules) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/rbac/rules`, { rbacRules }, {
        headers: this.config.headers
      });
      return response.data;
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
      const response = await axios.get(`${this.config.baseUrl}/rbac/rules`, {
        headers: this.config.headers
      });
      return response.data;
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
      const response = await axios.post(`${this.config.baseUrl}/rbac/rules`, { name }, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error("Unknown error.");
      }
    }
  }
}
