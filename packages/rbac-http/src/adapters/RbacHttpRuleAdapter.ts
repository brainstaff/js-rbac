import { RbacRule, RbacRuleAdapter } from "@brainstaff/rbac";
import axios, { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export default class RbacHttpRuleAdapter implements RbacRuleAdapter {
  private client: AxiosInstance;

  constructor(config: { baseURL: string }) {
    this.client = axios.create(config);
  }

  @rethrow
  async store(raw: RbacRule[]) {
    const all = raw.map((x) => new RbacRule(x));
    await this.client.post(`/rbac/rules`, { rbacRules: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(`/rbac/rules`);
    return res.data.map((x: any) => new RbacRule(x));
  }

  @rethrow
  async create(raw: RbacRule) {
    const one = new RbacRule(raw);
    await this.client.post(`/rbac/rules`, one);
  }

  @rethrow
  async find(name: RbacRule["name"]) {
    const res = await this.client.get(`/rbac/rules/${name}`);
    return res.data == null ? null : new RbacRule(res.data);
  }
}
