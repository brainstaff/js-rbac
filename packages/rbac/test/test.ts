import assert from 'assert';

import { RbacInMemoryAssignmentAdapter, RbacInMemoryItemAdapter, RbacInMemoryItemChildAdapter } from '@brainstaff/rbac-in-memory'

import { RbacAdapter, RbacManager } from '../src/index.js';
import { stringify } from '../src/utils.js';

const $ = {
  a: "a",
  m: "m",
  u: "u",
  item: {
    admin: "admin",
    manager: "manager",
    user: "user",
    trololo: "trololo",
    isOwnProfile: "isOwnProfile",
    updateProfile: "updateProfile",
  },
  contextId: {
    a: {
      product: "A",
      customer: "1",
    },
    b: {
      product: "B",
      customer: "1",
    },
  },
}

const createManager = async () => {
  type RbacContextId = {
    product: string,
    customer: string,
  };
  type RbacRulePayload = {
    me?: string,
    owner?: string,
  };
  const m = new RbacManager<RbacContextId, RbacRulePayload>({
    cacheAdapter: new RbacAdapter({
      assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
      itemAdapter: new RbacInMemoryItemAdapter(),
      itemChildAdapter: new RbacInMemoryItemChildAdapter(),
    }),
    persistentAdapter: new RbacAdapter({
      assignmentAdapter: new RbacInMemoryAssignmentAdapter(),
      itemAdapter: new RbacInMemoryItemAdapter(),
      itemChildAdapter: new RbacInMemoryItemChildAdapter(),
    }),
    ruleFactory: {
      createRule(name) {
        switch(name) {
          case $.item.isOwnProfile:
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
  await m.currentAdapter.store({
    assignments: [
      { userId: $.a, role: $.item.admin },
      { userId: $.m, role: $.item.manager },
    ],
    items: [
      { type: 'role', name: $.item.admin },
      { type: 'role', name: $.item.manager },
      { type: 'role', name: $.item.user },
      { type: 'rule', name: $.item.isOwnProfile },
      { type: 'perm', name: $.item.updateProfile },
    ],
    itemChildren: [
      { parent: $.item.admin, child: $.item.manager },
      { parent: $.item.manager, child: $.item.user },
      { parent: $.item.user, child: $.item.isOwnProfile },
      { parent: $.item.isOwnProfile, child: $.item.updateProfile },
      { parent: $.item.admin, child: $.item.updateProfile },
    ],
  });
  await m.loadCache();
  return m;
};

describe('RbacManager', function() {
  it('admin', async () => {
    const m = await createManager();
    assert.equal(await m.check($.a, $.item.admin), true, `should be ${$.item.admin}`);
    assert.equal(await m.check($.a, $.item.manager), true, `should be ${$.item.manager}`);
    assert.equal(await m.check($.a, $.item.user), true, `should be ${$.item.user}`);
    assert.equal(await m.check($.a, $.item.updateProfile, { me: $.a, owner: $.a }), true, `should be able to ${$.item.updateProfile} of ${$.a}`);
    assert.equal(await m.check($.a, $.item.updateProfile, { me: $.a, owner: $.m }), true, `should be able to ${$.item.updateProfile} of ${$.m}`);
  });

  it('manager', async () => {
    const m = await createManager();
    assert.equal(await m.check($.m, $.item.admin), false, `should not be ${$.item.admin}`);
    assert.equal(await m.check($.m, $.item.manager), true, `should be ${$.item.manager}`);
    assert.equal(await m.check($.m, $.item.user), true, `should be ${$.item.user}`);
    assert.equal(await m.check($.m, $.item.trololo), false, `should not be ${$.item.trololo}`);
    assert.equal(await m.check($.m, $.item.updateProfile, { me: $.m , owner: $.m }), true, `should be able to ${$.item.updateProfile} of ${$.m}`);
    assert.equal(await m.check($.m, $.item.updateProfile, { me: $.m , owner: $.a }), false, `should not be able to ${$.item.updateProfile} of ${$.a}`);
  });

  it('user', async () => {
    const m = await createManager();
    assert.equal(await m.check($.u, $.item.manager), false, `should not be ${$.item.manager}`);
    await m.assign({ userId: $.u, role: $.item.manager });
    assert.equal(await m.check($.u, $.item.manager), true, `should be ${$.item.manager}`);
    await m.revoke($.u, $.item.manager);
    assert.equal(await m.check($.u, $.item.manager), false, `should be ${$.item.manager} revoked`);
    assert.rejects(m.assign({ userId: $.u, role: $.item.trololo }), { name: 'Error', message: `No such role ${$.item.trololo}.`});
  });

  it(`user in context`, async () => {
    const m = await createManager();
    assert.equal(await m.check($.u, $.item.manager), false, `${stringify(undefined)}: should not be ${$.item.manager}`);
    assert.equal(await m.check($.u, $.item.manager, { contextId: $.contextId.a }), false, `${stringify($.contextId.a)}: should not be ${$.item.manager}`);
    await m.assign({ userId: $.u, role: $.item.manager, contextIds: [$.contextId.a] });
    assert.equal(await m.check($.u, $.item.manager), false, `${stringify(undefined)}: should not be ${$.item.manager}`);
    assert.equal(await m.check($.u, $.item.manager, { contextId: $.contextId.a }), true, `${stringify($.contextId.a)}: should be ${$.item.manager}`);
    assert.equal(await m.check($.u, $.item.manager, { contextId: $.contextId.b }), false, `${stringify($.contextId.b)}: should not be ${$.item.manager}`);
  });
});
