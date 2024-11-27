import assert from 'assert';

import { RbacInMemoryAssignmentAdapter, RbacInMemoryItemAdapter, RbacInMemoryItemChildAdapter, RbacInMemoryRuleAdapter } from '@brainstaff/rbac-in-memory'

import { RbacAdapter, RbacManager } from '../src/index.js';

const $ = {
  a: "a",
  m: "m",
  u: "u",
  rule: {
    isOwnProfile: "isOwnProfile",
  },
  item: {
    admin: "admin",
    manager: "manager",
    user: "user",
    trololo: "trololo",
    updateOwnProfile: "updateOwnProfile",
    updateProfile: "updateProfile",
  },
}

const createManager = async () => {
  type RbacRulePayload = {
    me?: string,
    owner?: string,
  };
  const manager = new RbacManager<RbacRulePayload>({
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
          case $.rule.isOwnProfile:
            return {
              execute: async ({ me, owner } = {}) => {
                return me != null && owner != null && me === owner;
              }
            };
          default:
            throw new Error(`Unexpected rule: ${name}`);
        }
      }
    }
  });
  await manager.currentAdapter.store({
    assignments: [
      { userId: $.a, role: $.item.admin },
      { userId: $.m, role: $.item.manager },
    ],
    items: [
      { name: $.item.admin, type: 'role', },
      { name: $.item.manager, type: 'role' },
      { name: $.item.user, type: 'role' },
      { name: $.item.updateProfile, type: 'permission' },
      { name: $.item.updateOwnProfile, type: 'permission', rule: $.rule.isOwnProfile },
    ],
    itemChildren: [
      { parent: $.item.admin, child: $.item.manager },
      { parent: $.item.manager, child: $.item.user },
      { parent: $.item.user, child: $.item.updateOwnProfile },
      { parent: $.item.updateOwnProfile, child: $.item.updateProfile },
      { parent: $.item.admin, child: $.item.updateProfile },
    ],
    rules: [
      { name: $.rule.isOwnProfile },
    ]
  });
  await manager.loadCache();
  return manager;
};

describe('RbacManager', function() {
  it('admin', async () => {
    const m = await createManager();
    assert.equal(await m.check($.a, $.item.admin), true, `should have role ${$.item.admin}`);
    assert.equal(await m.check($.a, $.item.manager), true, `should have role ${$.item.manager}`);
    assert.equal(await m.check($.a, $.item.user), true, `should have role ${$.item.user}`);
    assert.equal(await m.check($.a, $.item.updateProfile, { me: $.a, owner: $.a }), true, `should be able to ${$.item.updateProfile} of ${$.a}`);
    assert.equal(await m.check($.a, $.item.updateProfile, { me: $.a, owner: $.m }), true, `should be able to ${$.item.updateProfile} of ${$.m}`);
  });

  it('manager', async () => {
    const m = await createManager();
    assert.equal(await m.check($.m, $.item.admin), false, `should not have role ${$.item.admin}`);
    assert.equal(await m.check($.m, $.item.manager), true, `should have role ${$.item.manager}`);
    assert.equal(await m.check($.m, $.item.user), true, `should have role ${$.item.user}`);
    assert.equal(await m.check($.m, $.item.trololo), false, `should not have role ${$.item.trololo}`);
    assert.equal(await m.check($.m, $.item.updateProfile, { me: $.m , owner: $.m }), true, `should be able to ${$.item.updateProfile} of ${$.m}`);
    assert.equal(await m.check($.m, $.item.updateProfile, { me: $.m , owner: $.a }), false, `should not be able to ${$.item.updateProfile} of ${$.a}`);
  });

  it('user', async () => {
    const m = await createManager();
    assert.equal(await m.check($.u, $.item.manager), false, `should not have role ${$.item.manager}`);
    await m.assign($.u, $.item.manager);
    assert.equal(await m.check($.u, $.item.manager), true, `should have role ${$.item.manager}`);
    await m.revoke($.u, $.item.manager);
    assert.equal(await m.check($.u, $.item.manager), false, `should have role ${$.item.manager} revoked`);
    assert.rejects(m.assign($.u, $.item.trololo), { name: 'Error', message: `No such role ${$.item.trololo}.`});
  });
});
