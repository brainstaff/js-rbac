import { RbacAssignment, RbacItem, RbacRuleFactory, RbacRulePayload, RbacUserId } from "./rbac-abstractions";
import { RbacAdapter } from "./rbac-adapter";

export class RbacManager {
  private rbacCacheAdapter: RbacAdapter;
  private rbacPersistentAdapter: RbacAdapter;
  private rbacRuleFactory: RbacRuleFactory;
  private isCacheLoaded: boolean;

  constructor({ rbacCacheAdapter, rbacPersistentAdapter, rbacRuleFactory }: {
    rbacCacheAdapter: RbacAdapter,
    rbacPersistentAdapter: RbacAdapter,
    rbacRuleFactory: RbacRuleFactory,
  }) {
    this.rbacCacheAdapter = rbacCacheAdapter;
    this.rbacPersistentAdapter = rbacPersistentAdapter;
    this.rbacRuleFactory = rbacRuleFactory;
    this.isCacheLoaded = false;
  }

  async loadCache() {
    this.rbacCacheAdapter.store(await this.rbacPersistentAdapter.load());
    this.isCacheLoaded = true;
  }

  get currentAdapter() {
    if (this.isCacheLoaded) {
      return this.rbacCacheAdapter;
    } else {
      return this.rbacPersistentAdapter;
    }
  }

  async checkAccess(userId: RbacUserId, permissionOrRoleName: RbacItem['name'], payload?: RbacRulePayload) {
    const assignments = await this.currentAdapter.findAssignmentsByUserId(userId);
    for (let i = 0; i < assignments.length; i++) {
      if (await this.checkItem(assignments[i].role, permissionOrRoleName, payload)) {
        return true;
      }
    }
    return false;
  }

  async checkItem(currentItemName: RbacItem['name'], expectedItemName: RbacItem['name'], payload?: RbacRulePayload) {
    const currentItem = await this.currentAdapter.findItem(currentItemName);
    if (!currentItem) {
      return false;
    }
    if (currentItemName === expectedItemName) {
      // If we found permission we execute business rule
      if (currentItem.type === 'permission' && currentItem.rule) {
        return await this.rbacRuleFactory.createRule(currentItem.rule).execute(payload);
      } else {
        return true;
      }
    } else {
      // Before going deeper let's check business rule
      if (currentItem.type === 'permission' && currentItem.rule) {
        if (!(await this.rbacRuleFactory.createRule(currentItem.rule).execute(payload))) {
          return false;
        }
      }
      const children = await this.currentAdapter.findItemChildrenByParent(currentItemName);
      for (let i = 0; i < children.length; i++) {
        if (await this.checkItem(children[i].child, expectedItemName, payload)) {
          return true;
        }
      }
      return false;
    }
  }

  async assign(one: RbacAssignment) {
    const item = await this.currentAdapter.findItem(one.role);
    if (!item || item.type !== 'role') {
      throw new Error(`No such role ${one.role}.`);
    }
    const exists = await this.currentAdapter.findAssignment(one.userId, one.role) != null;
    if (exists) {
      return true;
    }
    if (this.isCacheLoaded) {
      await this.rbacCacheAdapter.createAssignment(one);
    }
    return await this.rbacPersistentAdapter.createAssignment(one);
  }

  async revoke(userId: RbacUserId, role: RbacItem['name']) {
    const assignment = await this.currentAdapter.findAssignment(userId, role);
    if (!assignment) {
      throw new Error(`Role "${role}" is not attached to the "${userId}".`);
    }
    if (this.isCacheLoaded) {
      await this.rbacCacheAdapter.deleteAssignment(userId, role);
    }
    return await this.rbacPersistentAdapter.deleteAssignment(userId, role);
  }

  async revokeAll(userId: RbacUserId) {
    if (this.isCacheLoaded) {
      await this.rbacCacheAdapter.deleteAssignment(userId);
    }
    return await this.rbacPersistentAdapter.deleteAssignment(userId);
  }

  async fetchUserAssignments(userId: RbacUserId) {
    return await this.currentAdapter.findAssignmentsByUserId(userId);
  }

  async fetchRoles() {
    return await this.currentAdapter.findRoles();
  }

  async fetchAllAssignments() {
    return await this.currentAdapter.findAllAssignments();
  }

  async fetchAllItems() {
    return await this.currentAdapter.findAllItems();
  }

  async fetchAllItemsChild() {
    return await this.currentAdapter.findAllItemsChild();
  }

  async fetchAllRules() {
    return await this.currentAdapter.findAllRules();
  }
}
