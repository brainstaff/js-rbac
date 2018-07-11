import axios from 'axios';

export class RbacHttpAdapter {
  constructor({ rbacHttpConfiguration }) {
    this.config = rbacHttpConfiguration || {
      baseUrl: 'http://localhost:4000',
      headers: {}
    };
    this.assignmentAdapter = new RbacHttpAssignmentAdapter(this.config);
    this.itemAdapter = new RbacHttpItemAdapter(this.config);
    this.itemChildAdapter = new RbacHttpItemChildAdapter(this.config);
    this.ruleAdapter = new RbacHttpRuleAdapter(this.config);
  }

  get dependencies() {
    return [
      'rbacHttpConfiguration'
    ];
  }

  async store(rbacHierachy) {
    await this.assignmentAdapter.store(rbacHierachy.rbacAssignments);
    await this.itemAdapter.store(rbacHierachy.rbacItems);
    await this.itemChildAdapter.store(rbacHierachy.rbacItemChildren);
    await this.ruleAdapter.store(rbacHierachy.rbacRules);
  }

  async load() {
    return {
      rbacAssignments: await this.assignmentAdapter.load(),
      rbacItems: await this.itemAdapter.load(),
      rbacItemChildren: await this.itemChildAdapter.load(),
      rbacRules: await this.ruleAdapter.load()
    }
  }

  // Core for checkAccess

  async findAssignmentsByUserId(userId) {
    return await this.assignmentAdapter.findByUserId(userId);
  }

  async findItem(name) {
    return await this.itemAdapter.find(name);
  }

  async findItemChildrenByParent(name) {
    return await this.itemChildAdapter.findByParent(name);
  }

  // Core for management

  async createAssignment(userId, role) {
    return await this.assignmentAdapter.create(userId, role);
  }

  async findAssignment(userId, role) {
    return await this.assignmentAdapter.find(userId, role);
  }

  async deleteAssignment(userId, role) {
    return await this.assignmentAdapter.delete(userId, role);
  }

  // Management

  async createItem(name, type) {
    return await this.itemAdapter.create(name, type);
  }

  async createItemChild(parent, child) {
    return await this.itemChildAdapter.create(parent, child);
  }

  async createRule(name) {
    return await this.ruleAdapter.create(name);
  }
}


export class RbacHttpAssignmentAdapter {
  constructor(config) {
    this.config = config;
  }

  // async store(rbacAssignments) {
  //   return axios.post({
  //     url: `${this.config.baseUrl}/rbac/assignments`,
  //     body: JSON.stringify({ rbacAssignments })
  //   })
  // }

  async load() {
    return axios.get(`${this.config.baseUrl}/rbac/assignments`, {
      headers: this.config.headers
    });
  }

  // async create(userId, role) {
  //   if (await this.find(userId, role)) {
  //     throw new Error(`Role ${role} is already assigned to user ${userId}.`);
  //   }
  //   this.rbacAssignments.push({ userId, role });
  // }
  //
  // async find(userId, role) {
  //   return this.rbacAssignments.find(assignment => assignment.userId === userId && assignment.role === role);
  // }
  //
  // async findByUserId(userId) {
  //   return this.rbacAssignments.filter(assignment => assignment.userId === userId);
  // }
  //
  // async delete(userId, role) {
  //   const assignmentIndex = this.rbacAssignments.findIndex(assignment => assignment.userId === userId && assignment.role === role);
  //   if (assignmentIndex !== -1) {
  //     this.rbacAssignments.splice(assignmentIndex, 1);
  //   } else {
  //     throw new Error(`No assignment between ${userId} and ${role} was found.`);
  //   }
  // }
}

export class RbacHttpItemAdapter {
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

export class RbacHttpItemChildAdapter {
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

export class RbacHttpRuleAdapter {
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
