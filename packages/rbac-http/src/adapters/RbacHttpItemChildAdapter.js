import axios from "axios";

export default class RbacHttpItemChildAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacItemChildren) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/rbac/item-children`, { rbacItemChildren }, {
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
      const response = await axios.get(`${this.config.baseUrl}/rbac/item-children`, {
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

  async create(parent, child) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/rbac/item-children`, { parent, child }, {
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

  async findByParent(parent) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/rbac/item-children/${parent}`, {
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
