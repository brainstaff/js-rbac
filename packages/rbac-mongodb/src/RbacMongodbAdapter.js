import RbacMongodbAssignmentAdapter from './adapters/RbacMongodbAssignmentAdapter';
import RbacMongodbItemAdapter from './adapters/RbacMongodbItemAdapter';
import RbacMongodbItemChildAdapter from './adapters/RbacMongodbItemChildAdapter';
import RbacMongodbRuleAdapter from './adapters/RbacMongodbRuleAdapter';

export default class RbacMongodbAdapter {
  constructor({rbacMongodbConnection}) {
    this.rbacMongodbConnection = rbacMongodbConnection;

    this.assignmentAdapter = new RbacMongodbAssignmentAdapter();
    this.itemAdapter = new RbacMongodbItemAdapter();
    this.itemChildAdapter = new RbacMongodbItemChildAdapter();
    this.ruleAdapter = new RbacMongodbRuleAdapter();
  }

  /**
   * To be used with @brainstaff/injector.
   * @returns {string[]}
   */
  get dependencies() {
    return ['rbacMongodbConnection'];
  }

  async store(rbacHierarchy) {
    await this.assignmentAdapter.store(rbacHierarchy.rbacAssignments);
    await this.itemAdapter.store(rbacHierarchy.rbacItems);
    await this.itemChildAdapter.store(rbacHierarchy.rbacItemChildren);
    await this.ruleAdapter.store(rbacHierarchy.rbacRules);
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