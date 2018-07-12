import axios from "axios";

export default class RbacHttpRuleAdapter {
  constructor(config) {
    this.config = config;
  }

  // async store(rbacRules) {
  //   this.rbacRules = rbacRules;
  // }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/rules`, {
      headers: this.config.headers
    });
  }

  // async create(name) {
  //   if (this.rbacRules.find(rule => rule.name === name)) {
  //     throw new Error(`Rule ${name} already exists.`);
  //   }
  //   this.rbacRules.push({ name });
  // }
}
