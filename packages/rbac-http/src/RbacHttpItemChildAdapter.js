import axios from "axios";

export default class RbacHttpItemChildAdapter {
  constructor(config) {
    this.config = config;
  }

  // async store(rbacItemChildren) {
  //   this.rbacItemChildren = rbacItemChildren;
  // }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/item-children`, {
      headers: this.config.headers
    });
  }

  // async create(parent, child) {
  //   if (this.rbacItemChildren.find(itemChild => itemChild.parent === parent && itemChild.child === child)) {
  //     throw new Error(`Association of ${parent} and ${child} already exists.`);
  //   }
  //   this.rbacItemChildren.push({ parent, child });
  // }
  //
  // async findByParent(parent) {
  //   return this.rbacItemChildren.filter(rbacItemChild => rbacItemChild.parent === parent);
  // }
}
