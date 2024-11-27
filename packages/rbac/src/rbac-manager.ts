import { RbacAssignment, RbacItem, RbacRuleFactory, RbacUserId } from "./rbac-abstractions";
import { RbacAdapter } from "./rbac-adapter";

export class RbacManager<RbacRulePayload> {
  private cacheAdapter: RbacAdapter;
  private persistentAdapter: RbacAdapter;
  private ruleFactory: RbacRuleFactory<RbacRulePayload>;
  private isCacheLoaded: boolean;

  constructor({ cacheAdapter, persistentAdapter, ruleFactory }: {
    cacheAdapter: RbacAdapter,
    persistentAdapter: RbacAdapter,
    ruleFactory: RbacRuleFactory<RbacRulePayload>,
  }) {
    this.cacheAdapter = cacheAdapter;
    this.persistentAdapter = persistentAdapter;
    this.ruleFactory = ruleFactory;
    this.isCacheLoaded = false;
  }

  async loadCache() {
    this.cacheAdapter.store(await this.persistentAdapter.load());
    this.isCacheLoaded = true;
  }

  get currentAdapter() {
    if (this.isCacheLoaded) {
      return this.cacheAdapter;
    } else {
      return this.persistentAdapter;
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
        return this.ruleFactory.createRule(currentItem.rule).execute(payload);
      } else {
        return true;
      }
    } else {
      // Before going deeper let's check business rule
      if (currentItem.type === 'permission' && currentItem.rule) {
        if (!(await this.ruleFactory.createRule(currentItem.rule).execute(payload))) {
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
      await this.cacheAdapter.createAssignment(one);
    }
    return this.persistentAdapter.createAssignment(one);
  }

  async revoke(userId: RbacUserId, role: RbacItem['name']) {
    const assignment = await this.currentAdapter.findAssignment(userId, role);
    if (!assignment) {
      throw new Error(`Role "${role}" is not attached to the "${userId}".`);
    }
    if (this.isCacheLoaded) {
      await this.cacheAdapter.deleteAssignment(userId, role);
    }
    return this.persistentAdapter.deleteAssignment(userId, role);
  }

  async revokeAll(userId: RbacUserId) {
    if (this.isCacheLoaded) {
      await this.cacheAdapter.deleteAssignment(userId);
    }
    return this.persistentAdapter.deleteAssignment(userId);
  }

  async fetchUserAssignments(userId: RbacUserId) {
    return this.currentAdapter.findAssignmentsByUserId(userId);
  }

  async fetchRoles() {
    return this.currentAdapter.findRoles();
  }

  async fetchAllAssignments() {
    return this.currentAdapter.findAllAssignments();
  }

  async fetchAllItems() {
    return this.currentAdapter.findAllItems();
  }

  async fetchAllItemsChild() {
    return this.currentAdapter.findAllItemsChild();
  }

  async fetchAllRules() {
    return this.currentAdapter.findAllRules();
  }
}
