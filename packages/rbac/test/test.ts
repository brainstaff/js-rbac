import assert from 'assert';

import { RbacInMemoryAssignmentAdapter, RbacInMemoryItemAdapter, RbacInMemoryItemChildAdapter, RbacInMemoryRuleAdapter } from '@brainstaff/rbac-in-memory'

import { RbacAdapter, RbacManager } from '../src/index.js';

const createRbacManager = async () => {
  const manager = new RbacManager<{
    user?: { 
      userId?: number;
    },
    profile?: {
      userId?: number;
    }
  }>({
    cacheAdapter: new RbacAdapter({
      assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
      itemAdapter: new RbacInMemoryItemAdapter(),
      itemChildAdapter: new RbacInMemoryItemChildAdapter(),
      ruleAdapter: new RbacInMemoryRuleAdapter(),
    }),
    persistentAdapter: new RbacAdapter({
      assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
      itemAdapter: new RbacInMemoryItemAdapter(),
      itemChildAdapter: new RbacInMemoryItemChildAdapter(),
      ruleAdapter: new RbacInMemoryRuleAdapter(),
    }),
    ruleFactory: {
      createRule(name) {
        switch(name) {
          case 'IsOwnProfile':
            return {
              execute: async ({ user, profile } = {}) => {
                return user?.userId != null && profile?.userId != null && user.userId === profile.userId;
              }
            };
          default:
            throw new Error(`Unexpected rule name: ${name}`);
        }
      }
    }
  });
  await manager.currentAdapter.store({
    assignments: [
      { userId: 'alexey', role: 'admin' },
      { userId: 'ilya', role: 'manager' },
    ],
    items: [
      { name: 'admin', type: 'role' },
      { name: 'manager', type: 'role' },
      { name: 'user', type: 'role' },
      { name: 'updateProfile', type: 'permission' },
      { name: 'updateOwnProfile', type: 'permission', rule: 'IsOwnProfile' },
    ],
    itemChildren: [
      { parent: 'admin', child: 'manager' },
      { parent: 'manager', child: 'user' },
      { parent: 'user', child: 'updateOwnProfile' },
      { parent: 'updateOwnProfile', child: 'updateProfile' },
      { parent: 'admin', child: 'updateProfile' },
    ],
    rules: [
      { name: 'IsOwnProfile' },
    ]
  });
  await manager.loadCache();
  return manager;
};

describe('RbacManager', function() {
  it('should assign and revoke permissions to user', async () => {
    const rbacManager = await createRbacManager();
    assert.equal(await rbacManager.checkAccess("igor", "manager"), false);
    await rbacManager.assign({ userId: "igor", role: "manager" });
    assert.equal(await rbacManager.checkAccess("igor", "manager"), true);
    await rbacManager.revoke("igor", "manager");
    assert.equal(await rbacManager.checkAccess("igor", "manager"), false);
    assert.rejects(rbacManager.assign({ userId: "igor", role: "manager2" }), { name: 'Error', message: "No such role manager2."});
  });

  it('should allow everything for admin', async () => {
    const rbacManager = await createRbacManager();
    // Checking for admin
    assert.equal(await rbacManager.checkAccess('alexey', 'admin'), true);
    assert.equal(await rbacManager.checkAccess('alexey', 'manager'), true);
    assert.equal(await rbacManager.checkAccess('alexey', 'user'), true);
    assert.equal(await rbacManager.checkAccess('alexey', 'updateProfile', { user: { userId: 1 }, profile: { userId: 1 } }), true);
    assert.equal(await rbacManager.checkAccess('alexey', 'updateProfile', { user: { userId: 1 }, profile: { userId: 2 } }), true);
  });

  it('should allow certain rule for manager', async () => {
    const rbacManager = await createRbacManager();
    // Checking for manager
    assert.equal(await rbacManager.checkAccess('ilya', 'admin'), false);
    assert.equal(await rbacManager.checkAccess('ilya', 'manager'), true);
    assert.equal(await rbacManager.checkAccess('ilya', 'user'), true);
    assert.equal(await rbacManager.checkAccess('ilya', 'trololo'), false);
    assert.equal(await rbacManager.checkAccess('ilya', 'updateOwnProfile', { user: { userId: 1 }, profile: { userId: 1 } }), true);
    assert.equal(await rbacManager.checkAccess('ilya', 'updateOwnProfile', { user: { userId: 1 }, profile: { userId: 2 } }), false);
    assert.equal(await rbacManager.checkAccess('ilya', 'updateProfile', { user: { userId: 1 }, profile: { userId: 1 } }), true);
    assert.equal(await rbacManager.checkAccess('ilya', 'updateProfile', { user: { userId: 1 }, profile: { userId: 2 } }), false);
  });
});
