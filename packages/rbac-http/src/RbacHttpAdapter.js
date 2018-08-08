import RbacHttpAssignmentAdapter from './adapters/RbacHttpAssignmentAdapter';
import RbacHttpRuleAdapter from './adapters/RbacHttpRuleAdapter';
import RbacHttpItemAdapter from './adapters/RbacHttpItemAdapter';
import RbacHttpItemChildAdapter from './adapters/RbacHttpItemChildAdapter';

export default class RbacHttpAdapter {
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
    };
  }

  async findAllAssignments() {
    return await this.assignmentAdapter.load();
  }

  async findAllItems() {
    return await this.itemAdapter.load();
  }

  async findAllItemsChild() {
    return await this.itemChildAdapter.load();
  }

  async findAllRules() {
    return await this.ruleAdapter.load();
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

  async findRoles() {
    return await this.itemAdapter.findByType('role');
  }

  async deleteAssignment(userId, role) {
    if (role) {
      return await this.assignmentAdapter.delete(userId, role);
    }

    return await this.assignmentAdapter.deleteByUser(userId);
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
