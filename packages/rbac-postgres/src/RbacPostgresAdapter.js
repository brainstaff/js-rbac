import RbacPostgresAssignmentAdapter from './adapters/RbacPostgresAssignmentAdapter'
import RbacPostgresItemAdapter from './adapters/RbacPostgresItemAdapter'
import RbacPostgresItemChildAdapter from './adapters/RbacPostgresItemChildAdapter'
import RbacPostgresRuleAdapter from './adapters/RbacPostgresRuleAdapter'

import RbacAssignment from './models/RbacAssignment';
import RbacItem from './models/RbacItem';
import RbacItemChild from './models/RbacItemChild';
import RbacRule from './models/RbacRule';

class RbacPostgresAdapter {
  constructor({ knex }) {
    RbacAssignment.knex(knex);
    RbacItem.knex(knex);
    RbacItemChild.knex(knex);
    RbacRule.knex(knex);
    this.assignmentAdapter = new RbacPostgresAssignmentAdapter();
    this.itemAdapter = new RbacPostgresItemAdapter();
    this.itemChildAdapter = new RbacPostgresItemChildAdapter();
    this.ruleAdapter = new RbacPostgresRuleAdapter();
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

export default RbacPostgresAdapter;

