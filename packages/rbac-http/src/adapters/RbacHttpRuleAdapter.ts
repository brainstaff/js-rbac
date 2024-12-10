import { RbacRule, RbacRuleAdapter } from "@brainstaff/rbac";
import axios, { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export const rulesUrl = "/rbac-rules";

class RbacHttpRuleAdapter implements RbacRuleAdapter {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  @rethrow
  async store(raw: RbacRule[]) {
    const all = raw.map((x) => new RbacRule(x));
    await this.client.post(rulesUrl, { rbacRules: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(rulesUrl);
    return res.data.map((x: any) => new RbacRule(x));
  }

  @rethrow
  async create(raw: RbacRule) {
    const one = new RbacRule(raw);
    await this.client.post(rulesUrl, one);
  }

  @rethrow
  async find(name: RbacRule["name"]) {
    const res = await this.client.get(`${rulesUrl}/${name}`);
    return res.data == null ? null : new RbacRule(res.data);
  }
}

export default RbacHttpRuleAdapter;
