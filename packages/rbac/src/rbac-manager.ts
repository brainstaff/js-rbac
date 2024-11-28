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

  private get r() {
    return this.isCacheLoaded ? this.cacheAdapter : this.persistentAdapter;
  }

  private get w() {
    return [this.isCacheLoaded ? this.cacheAdapter : null, this.persistentAdapter].filter(x => x != null);
  }

  async check(userId: RbacUserId, target: RbacItem['name'], payload?: { contextId?: RbacContextId } & RbacRulePayload) {
    const assignments = await this.r.findAssignmentsByUserId(userId);
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
    const item = await this.r.findItem(current);
    if (item == null) {
      return false;
    }
    const ok = item.type !== 'rule' || await this.ruleFactory.createRule(item.name).execute(payload);
    if (item.name === target || !ok) {
      return ok;
    }
    for (const { child } of await this.r.findItemChildrenByParent(item.name)) {
      if (await this.isOk(child, target, payload)) {
        return true;
      }
    }
    return false;
  }

  async assign(one: RbacAssignment<RbacContextId>) {
    const item = await this.r.findItem(one.role);
    if (!item || item.type !== 'role') {
      throw new Error(`No such role ${one.role}.`);
    }
    const exists = await this.r.findAssignment(one.userId, one.role) != null;
    if (exists) {
      return true;
    }
    for (const w of this.w) {
      await w.createAssignment(one);
    }
  }

  async revoke(userId: RbacUserId, role: RbacItem['name']) {
    const assignment = await this.r.findAssignment(userId, role);
    if (!assignment) {
      throw new Error(`Role "${role}" is not attached to the "${userId}".`);
    }
    for (const w of this.w) {
      await w.deleteAssignment(userId, role);
    }
  }

  async revokeAll(userId: RbacUserId) {
    for (const w of this.w) {
      await w.deleteAssignment(userId);
    }
  }

  async fetchUserAssignments(userId: RbacUserId) {
    return this.r.findAssignmentsByUserId(userId);
  }

  async fetchRoles() {
    return this.r.findRoles();
  }

  async fetchAllAssignments() {
    return this.r.findAllAssignments();
  }

  async fetchAllItems() {
    return this.r.findAllItems();
  }

  async fetchAllItemsChild() {
    return this.r.findAllItemsChild();
  }
}
