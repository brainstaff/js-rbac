import { RbacAssignment, RbacAssignmnentContextId, RbacItem, RbacItemChild, RbacRule, RbacRuleFactory, RbacUserId } from "./rbac-abstractions";
import { RbacAdapter } from "./rbac-adapter";
import { RbacError } from "./rbac-errors";

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

  async loadCache(): Promise<void> {
    const hierarchy = await this.persistentAdapter.load();
    await this.cacheAdapter.store(hierarchy);
    this.isCacheLoaded = true;
  }

  get currentAdapter(): RbacAdapter {
    if (this.isCacheLoaded) {
      return this.cacheAdapter;
    } else {
      return this.persistentAdapter;
    }
  }

  async check(
    userId: RbacUserId,
    itemName: RbacItem['name'],
    opts?: {
      contextId?: RbacAssignmnentContextId,
      payload?: RbacRulePayload,
    }): Promise<boolean> {
    const assignments = await this.currentAdapter.findAssignmentsByUserId(userId, opts?.contextId);
    for (const assignment of assignments) {
      if (await this.isOk(assignment.role, itemName, opts?.payload)) {
        return true;
      }
    }
    return false;
  }

  private async isOk(current: RbacItem['name'], target: RbacItem['name'], payload?: RbacRulePayload): Promise<boolean> {
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

  async assign(userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId): Promise<void> {
    const item = await this.currentAdapter.findItem(role);
    if (item == null || item.type !== 'role') {
      throw new RbacError(`No such role ${role}.`);
    }
    if (await this.currentAdapter.findAssignment(userId, role, contextId) != null) {
      return;
    }
    const assignment = new RbacAssignment({ userId, role, contextId });
    if (this.isCacheLoaded) {
      await this.cacheAdapter.createAssignment(assignment);
    }
    await this.persistentAdapter.createAssignment(assignment);
  }

  async revoke(userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId): Promise<void> {
    const assignment = await this.currentAdapter.findAssignment(userId, role, contextId);
    if (!assignment) {
      throw new RbacError(`Role "${role}" is not attached to the "${userId}".`);
    }
    if (this.isCacheLoaded) {
      await this.cacheAdapter.deleteAssignment(userId, role, contextId);
    }
    await this.persistentAdapter.deleteAssignment(userId, role, contextId);
  }

  async revokeAll(userId: RbacUserId, contextId?: RbacAssignmnentContextId): Promise<void> {
    if (this.isCacheLoaded) {
      await this.cacheAdapter.deleteAssignmentsByUser(userId, contextId);
    }
    await this.persistentAdapter.deleteAssignmentsByUser(userId, contextId);
  }

  async fetchUserAssignments(userId: RbacUserId, contextId?: RbacAssignmnentContextId): Promise<RbacAssignment[]> {
    return this.currentAdapter.findAssignmentsByUserId(userId, contextId);
  }

  async fetchRoles(): Promise<RbacItem[]> {
    return this.currentAdapter.findRoles();
  }

  async fetchAllAssignments(contextId?: RbacAssignmnentContextId): Promise<RbacAssignment[]> {
    return this.currentAdapter.findAllAssignments(contextId);
  }

  async fetchAllItems(): Promise<RbacItem[]> {
    return this.currentAdapter.findAllItems();
  }

  async fetchAllItemsChild(): Promise<RbacItemChild[]> {
    return this.currentAdapter.findAllItemsChild();
  }

  async fetchAllRules(): Promise<RbacRule[]> {
    return this.currentAdapter.findAllRules();
  }
}
