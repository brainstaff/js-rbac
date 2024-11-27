import fs from 'node:fs';

import knex from 'knex';

import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacItemAdapter, RbacItemChild, RbacItemChildAdapter, RbacRule, RbacRuleAdapter } from '@brainstaff/rbac';

import { RbacPostgresAssignmentAdapter } from '../src/index.js';
import { RbacPostgresItemAdapter } from '../src/index.js';
import { RbacPostgresItemChildAdapter } from '../src/index.js';
import { RbacPostgresRuleAdapter } from '../src/index.js';

// Initializing connection to test DB

let client = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    port: Number(process.env.POSTGRES_PORT),
    user: 'postgres',
    password: 'password',
    database: 'postgres'
  }
});

const timeout = 3000;

let expect: Chai.ExpectStatic;

before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
  await client.raw(`DROP DATABASE IF EXISTS rbac_postgres_test`);
  await client.raw(`CREATE DATABASE rbac_postgres_test`);
  await client.destroy();
  client = knex({
    client: 'pg',
    connection: {
      host: '127.0.0.1',
      port: Number(process.env.POSTGRES_PORT),
      user: 'postgres',
      password: 'password',
      database: 'rbac_postgres_test'
    }
  });
  await client.raw(fs.readFileSync('./data/tables.sql', 'utf-8'));
});

after(() => client.destroy());

describe('RbacPostgresItemAdapter', function() {
  this.timeout(timeout);

  const $: Record<string, RbacItem> = {
    admin: new RbacItem({ name: 'admin', type: 'role' }),
    manager: new RbacItem({ name: 'manager', type: 'role' }),
    user: new RbacItem({ name: 'user', type: 'role' }),
    updateProfile: new RbacItem({ name: 'updateProfile', type: 'permission' }),
    updateOwnProfile: new RbacItem({ name: 'updateOwnProfile', type: 'permission', rule: 'IsOwnProfile' }),
    regionManager: new RbacItem({ name: 'region manager', type: 'role' }),
  }

  it('should store many and load them', async () => {
    const adapter: RbacItemAdapter = new RbacPostgresItemAdapter({ client });
    const values = [$.admin, $.manager, $.user, $.updateProfile, $.updateOwnProfile];
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    const adapter: RbacItemAdapter = new RbacPostgresItemAdapter({ client });
    await adapter.create($.regionManager);
    const entry = await adapter.find($.regionManager.name);
    expect(entry).to.be.an('object').that.include($.regionManager);
  });

  it('should not create existing one', async () => {
    const adapter: RbacItemAdapter = new RbacPostgresItemAdapter({ client });
    try {
      await adapter.create($.regionManager);
      expect.fail('Should throw error.');
    } catch (err) {
      if (err instanceof Error) {
        expect(err.message).to.be.equal(`Item ${$.regionManager.name} already exists.`);
      } else {
        expect.fail("Thrown error should inherit from Error.");
      }
    }
  });

  it('should find all roles', async () => {
    const adapter: RbacItemAdapter = new RbacPostgresItemAdapter({ client });
    const entries = await adapter.findByType('role');
    expect(entries).to.have.deep.members([$.admin, $.manager, $.user, $.regionManager]);
  });
});

describe('RbacPostgresAssignmentAdapter', function() {
  this.timeout(timeout);

  const $: Record<string, RbacAssignment<unknown>> = {
    alexey: new RbacAssignment({ userId: 'alexey', role: 'admin' }),
    ilya: new RbacAssignment({ userId: 'ilya', role: 'manager' }),
    igor: new RbacAssignment({ userId: 'igor', role: 'manager' }),
  }

  it('should store many and load them', async () => {
    const adapter: RbacAssignmentAdapter<unknown> = new RbacPostgresAssignmentAdapter({ client });
    const values = [$.alexey, $.ilya];
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    const adapter: RbacAssignmentAdapter<unknown> = new RbacPostgresAssignmentAdapter({ client });
    await adapter.create($.igor);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    expect(entry).to.be.an('object').that.include($.igor);
  });

  it('should find many by user', async () => {
    const adapter: RbacAssignmentAdapter<unknown> = new RbacPostgresAssignmentAdapter({ client });
    const entries = await adapter.findByUserId($.igor.userId);
    expect(entries).to.have.deep.members([$.igor]);
  });

  it('should delete one and be unable to find it', async () => {
    const adapter: RbacAssignmentAdapter<unknown> = new RbacPostgresAssignmentAdapter({ client });
    await adapter.delete($.igor.userId, $.igor.role);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    expect(entry).to.be.null;
    const all = await adapter.load();
    expect(all).to.have.deep.members([$.alexey, $.ilya]);
  });

  it('should delete many by user', async () => {
    const adapter: RbacAssignmentAdapter<unknown> = new RbacPostgresAssignmentAdapter({ client });
    await adapter.deleteByUser($.alexey.userId);
    const all = await adapter.load();
    expect(all).to.have.deep.members([$.ilya]);
  });
});

describe('RbacPostgresItemChildAdapter', function() {
  this.timeout(timeout);

  const $: Record<string, RbacItemChild> = {
    admin_manager: new RbacItemChild({ parent: 'admin', child: 'manager' }),
    manager_user: new RbacItemChild({ parent: 'manager', child: 'user' }),
    user_updateOwnProfile: new RbacItemChild({ parent: 'user', child: 'updateOwnProfile' }),
    updateOwnProfile_updateProfile: new RbacItemChild({ parent: 'updateOwnProfile', child: 'updateProfile' }),
    admin_updateProfile: new RbacItemChild({ parent: 'admin', child: 'updateProfile' }),
    manager_regionManager: new RbacItemChild({ parent: 'manager', child: 'region manager' }),
  }

  it('should store many and load them', async () => {
    const adapter: RbacItemChildAdapter = new RbacPostgresItemChildAdapter({ client });
    const values = [
      $.admin_manager,
      $.manager_user,
      $.user_updateOwnProfile,
      $.updateOwnProfile_updateProfile,
      $.admin_updateProfile,
    ]
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    const adapter: RbacItemChildAdapter = new RbacPostgresItemChildAdapter({ client });
    await adapter.create($.manager_regionManager);
    const entry = await adapter.find($.manager_regionManager.parent, $.manager_regionManager.child);
    expect(entry).to.be.an('object').that.include($.manager_regionManager);
  });

  it('should find many by parent', async () => {
    const adapter: RbacItemChildAdapter = new RbacPostgresItemChildAdapter({ client });
    const entry = await adapter.findByParent($.admin_manager.parent);
    expect(entry).to.have.deep.members([$.admin_manager, $.admin_updateProfile]);
  });
});

describe('RbacPostgresRuleAdapter', function() {
  this.timeout(timeout);

  const $: Record<string, RbacRule> = {
    IsOwnProfile: new RbacRule({ name: 'IsOwnProfile' }),
    IsOwnDocument: new RbacRule({ name: 'IsOwnDocument' }),
    IsGroupLeader: new RbacRule({ name: 'IsGroupLeader' }),
  };

  it('should store many and load them', async () => {
    const adapter: RbacRuleAdapter = new RbacPostgresRuleAdapter({ client });
    const values = [$.IsOwnProfile, $.IsOwnDocument];
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    const adapter: RbacRuleAdapter = new RbacPostgresRuleAdapter({ client });
    await adapter.create($.IsGroupLeader);
    const entry = await adapter.find($.IsGroupLeader.name);
    expect(entry).to.be.an('object').that.include($.IsGroupLeader);
  });
});
