import axios from "axios";

export default class RbacHttpItemAdapter {
  constructor(config) {
    this.config = config;
  }

  // async store(rbacItems) {
  //   this.rbacItems = rbacItems;
  // }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/items`, {
      headers: this.config.headers
    });
  }

  // async create(name, type, rule) {
  //   if (this.rbacItems.find(item => item.name === name)) {
  //     throw new Error(`Item ${name} already exists.`);
  //   }
  //   this.rbacItems.push({ name, type, rule });
  // }
  //
  // async find(name) {
  //   return this.rbacItems.find(rbacItem => rbacItem.name === name);
  // }
}
