import axios from 'axios';

export default class RbacHttpAssignmentAdapter {
  constructor(config) {
    this.config = config;
  }

  async store(rbacAssignments) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/rbac/assignments`, { rbacAssignments }, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async load() {
    try {
      const response = await axios.get(`${this.config.baseUrl}/rbac/assignments`, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async create(userId, role) {
    try {
      const response = await axios.post(`${this.config.baseUrl}/rbac/assignments`, { userId, role }, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async find(userId, role) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/rbac/assignments/${userId}/${role}`, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async findByUserId(userId) {
    try {
      const response = await axios.get(`${this.config.baseUrl}/rbac/assignments/${userId}`, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async delete(userId, role) {
    try {
      const response = await axios.delete(`${this.config.baseUrl}/rbac/assignments/${userId}/${role}`, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }

  async deleteByUser(userId) {
    try {
      const response = await axios.delete(`${this.config.baseUrl}/rbac/assignments/${userId}`, {
        headers: this.config.headers
      });
      return response.data;
    } catch (error) {
      if (error.response.data.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(error.toString());
      }
    }
  }
}
