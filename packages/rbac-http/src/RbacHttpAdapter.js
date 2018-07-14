import RbacHttpAssignmentAdapter from "./RbacHttpAssignmentAdapter";
import RbacHttpRuleAdapter from "./RbacHttpRuleAdapter";
import RbacHttpItemAdapter from "./RbacHttpItemAdapter";
import RbacHttpItemChildAdapter from "./RbacHttpItemChildAdapter";

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
