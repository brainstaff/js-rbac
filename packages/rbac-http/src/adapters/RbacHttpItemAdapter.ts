import { AxiosInstance } from 'axios';

import { RbacItem, RbacItemAdapter } from '@brainstaff/rbac';

import { rethrow } from '../utils/rethrow';

export default class RbacHttpItemAdapter implements RbacItemAdapter {
  private client: AxiosInstance;

  constructor(deps: {
    client: AxiosInstance;
  }) {
    this.client = deps.client;
  }

  @rethrow
  async store(raw: RbacItem[]) {
    const all = raw.map(x => new RbacItem(x));
    await this.client.post(`/rbac/items`, { rbacItems: all });
  }

  @rethrow
  async load() {
    const res = await this.client.get(`/rbac/items`);
    return res.data.map((x: any) => new RbacItem(x));
  }

  @rethrow
  async create(raw: RbacItem) {
    const one = new RbacItem(raw);
    await this.client.post(`/rbac/items`, one);
  }

  @rethrow
  async find(name: RbacItem['name']) {
    const res = await this.client.get(`/rbac/items/${name}`);
    return res.data == null ? null : new RbacItem(res.data);
  }

  @rethrow
  async findByType(type: RbacItem['type']) {
    const res = await this.client.get(`/rbac/items/${type}s`);
    return res.data.map((x: any) => new RbacItem(x));
  }
}
