import { RbacAssignment, RbacItem, RbacRuleFactory, RbacUserId } from "./rbac-abstractions";
import { RbacAdapter } from "./rbac-adapter";

export class RbacManager<RbacRulePayload = unknown> {
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

  async check(userId: RbacUserId, itemName: RbacItem['name'], payload?: RbacRulePayload) {
    const assignments = await this.currentAdapter.findAssignmentsByUserId(userId);
    for (const assignment of assignments) {
      if (await this.isOk(assignment.role, itemName, payload)) {
        return true;
      }
    }
    return false;
  }

  private async isOk(current: RbacItem['name'], target: RbacItem['name'], payload?: RbacRulePayload) {
    const item = await this.currentAdapter.findItem(current);
    if (item == null) {
      return false;
    }
    const ok = item.type !== 'permission' || item.rule == null || await this.ruleFactory.createRule(item.rule).execute(payload);
    if (item.name === target || !ok) {
      return ok;
    }
    const children = await this.currentAdapter.findItemChildrenByParent(item.name);
    for (const { child } of children) {
      if (await this.isOk(child, target, payload)) {
        return true;
      }
    }
    return false;
  }

  async assign(userId: RbacUserId, role: RbacItem['name']) {
    const item = await this.currentAdapter.findItem(role);
    if (item == null || item.type !== 'role') {
      throw new Error(`No such role ${role}.`);
    }
    if (await this.currentAdapter.findAssignment(userId, role) != null) {
      return true;
    }
    const assignment = new RbacAssignment({ userId, role });
    if (this.isCacheLoaded) {
      await this.cacheAdapter.createAssignment(assignment);
    }
    return this.persistentAdapter.createAssignment(assignment);
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
