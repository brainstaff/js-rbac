import {
  RbacItem,
  RbacItemChild,
  RbacItemChildAdapter,
} from "@brainstaff/rbac";
import axios, { AxiosInstance } from "axios";

import { rethrow } from "../utils/rethrow";

export const itemChildrenUrl = "/rbac-item-children";

class RbacHttpItemChildAdapter implements RbacItemChildAdapter {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({ baseURL });
  }

  @rethrow
  async store(raw: RbacItemChild[]) {
    const all = raw.map((x) => new RbacItemChild(x));
    await this.client.post(itemChildrenUrl, { rbacItemChildren: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(itemChildrenUrl);
    return res.data.map((x: any) => new RbacItemChild(x));
  }

  @rethrow
  async create(raw: RbacItemChild) {
    const one = new RbacItemChild(raw);
    await this.client.post(itemChildrenUrl, one);
  }

  @rethrow
  async find(parent: RbacItem["name"], child: RbacItem["name"]) {
    const res = await this.client.get(`${itemChildrenUrl}/${parent}/${child}`);
    return res.data == null ? null : new RbacItemChild(res.data);
  }

  @rethrow
  async findByParent(parent: RbacItem["name"]) {
    const res = await this.client.get(`${itemChildrenUrl}/${parent}`);
    return res.data.map((x: any) => new RbacItemChild(x));
  }
}

export default RbacHttpItemChildAdapter;
