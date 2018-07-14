export class RbacManager {
  constructor({ rbacCacheAdapter, rbacPersistentAdapter, rbacRuleFactory }) {
    this.rbacCacheAdapter = rbacCacheAdapter;
    this.rbacPersistentAdapter = rbacPersistentAdapter;
    this.rbacRuleFactory = rbacRuleFactory;
  }

  get dependencies() {
    return [
      'rbacCacheAdapter',
      'rbacPersistentAdapter',
      'rbacRuleFactory'
    ]
  }

  async loadCache() {
    this.rbacCacheAdapter.store(await this.rbacPersistentAdapter.load());
  }

  async checkAccess(userId, permissionOrRoleName, payload) {
    const assignments = await this.rbacCacheAdapter.findAssignmentsByUserId(userId);
    for (let i = 0; i < assignments.length; i++) {
      if (await this.checkItem(assignments[i].role, permissionOrRoleName, payload)) {
        return true;
      }
    }
    return false;
  }

  async checkItem(currentItemName, expectedItemName, payload) {
    const currentItem = await this.rbacCacheAdapter.findItem(currentItemName);
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
      const children = await this.rbacCacheAdapter.findItemChildrenByParent(currentItemName);
      for (let i = 0; i < children.length; i++) {
        if (await this.checkItem(children[i].child, expectedItemName, payload)) {
          return true;
        }
      }
      return false;
    }
  }

  async assign(userId, role) {
    const item = await this.rbacCacheAdapter.findItem(role);
    if (!item || item.type !== 'role') {
      throw new Error(`No such role ${role}.`);
    }
    const assignment = await this.rbacCacheAdapter.findAssignment(userId, role);
    if (assignment) {
      return true;
    }
    return (
      await this.rbacPersistentAdapter.createAssignment(userId, role) &&
      await this.rbacCacheAdapter.createAssignment(userId, role)
    )
  }

  async revoke(userId, role) {
    const assignment = await this.rbacCacheAdapter.findAssignment(userId, role);
    if (!assignment) {
      throw new Error(`Role "${role}" is not attached to the "${userId}".`);
    }
    return (
      await this.rbacPersistentAdapter.deleteAssignment(userId, role) &&
      await this.rbacCacheAdapter.deleteAssignment(userId, role)
    )
  }
}
