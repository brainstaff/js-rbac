import assert from 'assert';

import { RbacInMemoryAssignmentAdapter, RbacInMemoryItemAdapter, RbacInMemoryItemChildAdapter, RbacInMemoryRuleAdapter } from '@brainstaff/rbac-in-memory'

import { RbacAdapter, RbacAssignment, RbacItem, RbacItemChild, RbacManager, RbacRule, RbacRuleFactory } from '../src/index.js';

const createRbacManager = async () => {
  const rbacAssignments: RbacAssignment[] = [
    { userId: 'alexey', role: 'admin' },
    { userId: 'ilya', role: 'manager' }
  ];

  const rbacItems: RbacItem[] = [
    { name: 'admin', type: 'role' },
    { name: 'manager', type: 'role' },
    { name: 'user', type: 'role' },
    { name: 'updateProfile', type: 'permission' },
    { name: 'updateOwnProfile', type: 'permission', rule: 'IsOwnProfile' },
  ];

  const rbacItemChildren: RbacItemChild[] = [
    { parent: 'admin', child: 'manager' },
    { parent: 'manager', child: 'user' },
    { parent: 'user', child: 'updateOwnProfile' },
    { parent: 'updateOwnProfile', child: 'updateProfile' },
    { parent: 'admin', child: 'updateProfile' }
  ];

  const rbacRules: RbacRule[] = [
    { name: 'IsOwnProfile' }
  ];

  const rbacCacheAdapter = new RbacAdapter({
    assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
    itemAdapter: new RbacInMemoryItemAdapter(),
    itemChildAdapter: new RbacInMemoryItemChildAdapter(),
    ruleAdapter: new RbacInMemoryRuleAdapter(),
  });
  const rbacPersistentAdapter = new RbacAdapter({
    assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
    itemAdapter: new RbacInMemoryItemAdapter(),
    itemChildAdapter: new RbacInMemoryItemChildAdapter(),
    ruleAdapter: new RbacInMemoryRuleAdapter(),
  });
  await rbacPersistentAdapter.store({
    rbacAssignments,
    rbacItems,
    rbacItemChildren,
    rbacRules
  });

  const rbacRuleFactory: RbacRuleFactory<{ 
    user?: { 
      userId?: number;
    },
    profile?: {
      userId?: number;
    }
  }> = {
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
  };

  const rbacManager = new RbacManager({
    rbacCacheAdapter,
    rbacPersistentAdapter,
    rbacRuleFactory
  });

  await rbacManager.loadCache();

  return rbacManager;
};

describe('RbacManager', function() {
  it('should assign and revoke permissions to user', async () => {
    const rbacManager = await createRbacManager();
    assert.equal(await rbacManager.checkAccess("igor", "manager"), false);
    await rbacManager.assign("igor", "manager");
    assert.equal(await rbacManager.checkAccess("igor", "manager"), true);
    await rbacManager.revoke("igor", "manager");
    assert.equal(await rbacManager.checkAccess("igor", "manager"), false);
    assert.rejects(rbacManager.assign("igor", "manager2"), { name: 'Error', message: "No such role manager2."});
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
