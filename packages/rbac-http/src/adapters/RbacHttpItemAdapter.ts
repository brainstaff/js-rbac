import { RbacItem, RbacItemAdapter } from "@brainstaff/rbac";
import axios, { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export const itemsUrl = "/rbac-items";

class RbacHttpItemAdapter implements RbacItemAdapter {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  @rethrow
  async store(raw: RbacItem[]) {
    const all = raw.map((x) => new RbacItem(x));
    await this.client.post(itemsUrl, { rbacItems: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(itemsUrl);
    return res.data.map((x: any) => new RbacItem(x));
  }

  @rethrow
  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    await this.client.post(itemsUrl, one);
  }

  @rethrow
  async find(name: RbacItem["name"]) {
    const res = await this.client.get(`${itemsUrl}/${name}`);
    return res.data == null ? null : new RbacItem(res.data);
  }

  @rethrow
  async findByType(type: RbacItem["type"]) {
    const res = await this.client.get(`${itemsUrl}/${type}s`);
    return res.data.map((x: any) => new RbacItem(x));
  }
}

export default RbacHttpItemAdapter;
