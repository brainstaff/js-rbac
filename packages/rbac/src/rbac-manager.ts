import { RbacAssignment, RbacItem, RbacRuleFactory, RbacUserId } from "./rbac-abstractions";
import { RbacAdapter } from "./rbac-adapter";
import { stringify } from "./utils";

export class RbacManager<RbacContextId, RbacRulePayload extends object> {
  private cacheAdapter: RbacAdapter<RbacContextId>;
  private persistentAdapter: RbacAdapter<RbacContextId>;
  private ruleFactory: RbacRuleFactory<RbacRulePayload>;
  private isCacheLoaded: boolean;

  constructor({ cacheAdapter, persistentAdapter, ruleFactory }: {
    cacheAdapter: RbacAdapter<RbacContextId>,
    persistentAdapter: RbacAdapter<RbacContextId>,
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

  async check(userId: RbacUserId, target: RbacItem['name'], payload?: { contextId?: RbacContextId } & RbacRulePayload) {
    const assignments = await this.currentAdapter.findAssignmentsByUserId(userId);
    if (assignments.length === 0) {
      return false;
    }
    const stringifiedContextId = stringify(payload?.contextId);
    for (const { role, contextIds } of assignments) {
      const enabled = contextIds === undefined || contextIds.some(x => stringify(x) === stringifiedContextId);
      if (enabled && await this.isOk(role, target, payload)) {
        return true;
      }
    }
    return false;
  }

  private async isOk(current: RbacItem['name'], target: RbacItem['name'], payload?: RbacRulePayload) {
    const item = await this.currentAdapter.findItem(current);
    if (!item) {
      return false;
    }
    if (item.name === target) {
      // If we found permission we execute business rule
      if (item.type === 'permission' && item.rule) {
        return this.ruleFactory.createRule(item.rule).execute(payload);
      } else {
        return true;
      }
    } else {
      // Before going deeper let's check business rule
      if (item.type === 'permission' && item.rule) {
        if (!(await this.ruleFactory.createRule(item.rule).execute(payload))) {
          return false;
        }
      }
      const children = await this.currentAdapter.findItemChildrenByParent(item.name);
      for (let i = 0; i < children.length; i++) {
        if (await this.isOk(children[i].child, target, payload)) {
          return true;
        }
      }
      return false;
    }
  }

  async assign(one: RbacAssignment<RbacContextId>) {
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
