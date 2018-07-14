export class RbacInMemoryAdapter {
  constructor() {
    this.assignmentAdapter = new RbacInMemoryAssignmentAdapter();
    this.itemAdapter = new RbacInMemoryItemAdapter();
    this.itemChildAdapter = new RbacInMemoryItemChildAdapter();
    this.ruleAdapter = new RbacInMemoryRuleAdapter();
  }

  /**
   * To be used with @brainstaff/injector.
   * @returns {string[]}
   */
  get dependencies() {
    return [];
  }

  async store(rbacHierarchy) {
    await this.assignmentAdapter.store([...rbacHierarchy.rbacAssignments]);
    await this.itemAdapter.store([...rbacHierarchy.rbacItems]);
    await this.itemChildAdapter.store([...rbacHierarchy.rbacItemChildren]);
    await this.ruleAdapter.store([...rbacHierarchy.rbacRules]);
  }

  async load() {
    return {
      rbacAssignments: await this.assignmentAdapter.load(),
      rbacItems: await this.itemAdapter.load(),
      rbacItemChildren: await this.itemChildAdapter.load(),
      rbacRules: await this.ruleAdapter.load()
    };
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

export class RbacInMemoryAssignmentAdapter {
  constructor() {
    this.rbacAssignments = [];
  }

  async store(rbacAssignments) {
    this.rbacAssignments = rbacAssignments;
  }

  async load() {
    return this.rbacAssignments;
  }

  async create(userId, role) {
    if (this.rbacAssignments.find(assignment => assignment.userId === userId && assignment.role === role)) {
      throw new Error(`Role ${role} is already assigned to user ${userId}.`);
    }
    this.rbacAssignments.push({ userId, role });
  }

  async find(userId, role) {
    return this.rbacAssignments.find(assignment => assignment.userId === userId && assignment.role === role);
  }

  async findByUserId(userId) {
    return this.rbacAssignments.filter(assignment => assignment.userId === userId);
  }

  async delete(userId, role) {
    const assignmentIndex = this.rbacAssignments.findIndex(assignment => assignment.userId === userId && assignment.role === role);
    if (assignmentIndex !== -1) {
      this.rbacAssignments.splice(assignmentIndex, 1);
    } else {
      throw new Error(`No assignment between ${userId} and ${role} was found.`);
    }
  }
}

export class RbacInMemoryItemAdapter {
  constructor() {
    this.rbacItems = [];
  }

  async store(rbacItems) {
    this.rbacItems = rbacItems;
  }

  async load() {
    return this.rbacItems;
  }

  async create(name, type, rule) {
    if (this.rbacItems.find(item => item.name === name)) {
      throw new Error(`Item ${name} already exists.`);
    }
    this.rbacItems.push({ name, type, rule });
  }

  async find(name) {
    return this.rbacItems.find(rbacItem => rbacItem.name === name);
  }
}

export class RbacInMemoryItemChildAdapter {
  constructor() {
    this.rbacItemChildren = [];
  }

  async store(rbacItemChildren) {
    this.rbacItemChildren = rbacItemChildren;
  }

  async load() {
    return this.rbacItemChildren;
  }

  async create(parent, child) {
    if (this.rbacItemChildren.find(itemChild => itemChild.parent === parent && itemChild.child === child)) {
      throw new Error(`Association of ${parent} and ${child} already exists.`);
    }
    this.rbacItemChildren.push({ parent, child });
  }

  async findByParent(parent) {
    return this.rbacItemChildren.filter(rbacItemChild => rbacItemChild.parent === parent);
  }
}

export class RbacInMemoryRuleAdapter {
  constructor() {
    this.rbacRules = [];
  }

  async store(rbacRules) {
    this.rbacRules = rbacRules;
  }

  async load() {
    return this.rbacRules;
  }

  async create(name) {
    if (this.rbacRules.find(rule => rule.name === name)) {
      throw new Error(`Rule ${name} already exists.`);
    }
    this.rbacRules.push({ name });
  }
}
