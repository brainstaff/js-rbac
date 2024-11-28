import http from 'node:http';
import assert from 'node:assert';

import express from 'express';
import axios from 'axios';

import { RbacAdapter, RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacItemAdapter, RbacItemChild, RbacItemChildAdapter } from '@brainstaff/rbac';
import { RbacInMemoryAssignmentAdapter, RbacInMemoryItemAdapter, RbacInMemoryItemChildAdapter } from '@brainstaff/rbac-in-memory'

import { RbacHttpAssignmentAdapter } from '../src/index.js';
import { RbacHttpItemAdapter } from '../src/index.js';
import { RbacHttpItemChildAdapter } from '../src/index.js';
import { RbacHierarchy } from '@brainstaff/rbac/src/rbac-abstractions.js';

const client = axios.create({
  baseURL: 'http://localhost:4001',
  headers: {}
});

const timeout = 10000;

const newErrHandler = (res: express.Response) => {
  return (err: unknown) => res.status(400).json({ message: err instanceof Error ? err.message : 'No message.' });
};

describe('RbacHttpAssignmentAdapter', function() {
  this.timeout(timeout);
  
  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryAssignmentAdapter();
    app.post('/rbac/assignments', (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacAssignments, userId, role } = req.body;
      if (rbacAssignments) {
        db.store(rbacAssignments).then(() => res.end()).catch(errHandler);
      } else {
        db.create({ userId, role }).then(() => res.end()).catch(errHandler);
      }
    });
    app.get('/rbac/assignments', (_req, res) => {
      db.load().then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/assignments/:userId/:role', (req, res) => {
      db.find(req.params.userId, req.params.role).then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/assignments/:userId', (req, res) => {
      db.findByUserId(req.params.userId).then(entry => res.json(entry)).catch(newErrHandler(res));
    });
    app.delete('/rbac/assignments/:userId/:role', (req, res) => {
      db.delete(req.params.userId, req.params.role).then(entry => res.json(entry)).catch(newErrHandler(res));
    });
    app.delete('/rbac/assignments/:userId', (req, res) => {
      db.deleteByUser(req.params.userId).then(entry => res.json(entry)).catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacAssignmentAdapter = new RbacHttpAssignmentAdapter({ client });

  const $ = {
    alexey: new RbacAssignment({ userId: 'alexey', role: 'admin' }),
    ilya: new RbacAssignment({ userId: 'ilya', role: 'manager' }),
    igor: new RbacAssignment({ userId: 'igor', role: 'manager' }),
  }

  it('should store many and load them', async () => {
    const values = [$.alexey, $.ilya];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.igor);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    assert.deepEqual(entry, $.igor);
  });

  it('should find many by user', async () => {
    const entries = await adapter.findByUserId($.igor.userId);
    assert.deepEqual(entries, [$.igor]);
  });

  it('should delete one and be unable to find it', async () => {
    await adapter.delete($.igor.userId, $.igor.role);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    assert.deepEqual(entry, null);
    const all = await adapter.load();
    assert.deepEqual(all, [$.alexey, $.ilya]);
  });

  it('should not delete missing one', async () => {
    try {
      await adapter.delete($.igor.userId, $.igor.role);
      assert.fail('Should throw error.');
    } catch (err) {
      if (err instanceof Error)  {
        assert.deepEqual(err.message, `No assignment between ${$.igor.userId} and ${$.igor.role} was found.`);
      } else {
        assert.fail('Thrown error should inherit from Error.');
      }
    }
  });

  it('should delete many by user', async () => {
    await adapter.deleteByUser($.alexey.userId);
    const all = await adapter.load();
    assert.deepEqual(all, [$.ilya]);
  });
});

describe('RbacHttpItemAdapter', function() {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryItemAdapter();
    app.post('/rbac/items', (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacItems, name, type } = req.body;
      if (rbacItems) {
        db.store(rbacItems).then(() => res.end()).catch(errHandler);
      } else {
        db.create({ name, type }).then(() => res.end()).catch(errHandler);
      }
    });
    app.get('/rbac/items', (_req, res) => {
      db.load().then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/items/roles', (_req, res) => {
      db.findByType('role').then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/items/:name', (req, res) => {
      db.find(req.params.name).then(entry => res.json(entry)).catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacItemAdapter = new RbacHttpItemAdapter({ client });

  const $ = {
    admin: new RbacItem({ type: 'role', name: 'admin' }),
    manager: new RbacItem({ type: 'role', name: 'manager' }),
    user: new RbacItem({ type: 'role', name: 'user' }),
    updateProfile: new RbacItem({ type: 'perm', name: 'updateProfile' }),
    isOwnProfile: new RbacItem({ type: 'rule', name: 'isOwnProfile' }),
    regionManager: new RbacItem({ type: 'role', name: 'region manager' }),
  }

  it('should store many and load them', async () => {
    const values = [$.admin, $.manager, $.user, $.updateProfile, $.isOwnProfile];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.regionManager);
    const entry = await adapter.find($.regionManager.name);
    assert.deepEqual(entry, $.regionManager);
  });

  it('should not create existing one', async () => {
    try {
      await adapter.create($.regionManager);
      assert.fail('Should throw error.');
    } catch (err) {
      if (err instanceof Error) {
        assert.equal(err.message, `Item ${$.regionManager.name} already exists.`);
      } else {
        assert.fail('Thrown error should inherit from Error.');
      }
    }
  });

  it('should find all roles', async () => {
    const entries = await adapter.findByType('role');
    assert.deepEqual(entries, [$.admin, $.manager, $.user, $.regionManager]);
  });
});

describe('RbacHttpItemChildAdapter', function() {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryItemChildAdapter();
    app.post('/rbac/item-children', (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacItemChildren, parent, child } = req.body;
      if (rbacItemChildren) {
        db.store(rbacItemChildren).then(() => res.end()).catch(errHandler);
      } else {
        db.create({ parent, child }).then(() => res.end()).catch(errHandler);
      }
    });
    app.get('/rbac/item-children', (_req, res) => {
      db.load().then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/item-children/:parent/:child', (req, res) => {
      db.find(req.params.parent, req.params.child).then(entries => res.json(entries)).catch(newErrHandler(res));
    });
    app.get('/rbac/item-children/:parent', (req, res) => {
      db.findByParent(req.params.parent).then(entry => res.json(entry)).catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacItemChildAdapter = new RbacHttpItemChildAdapter({ client });

  const $ = {
    admin_manager: new RbacItemChild({ parent: 'admin', child: 'manager' }),
    manager_user: new RbacItemChild({ parent: 'manager', child: 'user' }),
    user_isOwnProfile: new RbacItemChild({ parent: 'user', child: 'isOwnProfile' }),
    isOwnProfile_updateProfile: new RbacItemChild({ parent: 'isOwnProfile', child: 'updateProfile' }),
    admin_updateProfile: new RbacItemChild({ parent: 'admin', child: 'updateProfile' }),
    manager_regionManager: new RbacItemChild({ parent: 'manager', child: 'region manager' }),
  }

  it('should store many and load them', async () => {
    const values = [
      $.admin_manager,
      $.manager_user,
      $.user_isOwnProfile,
      $.isOwnProfile_updateProfile,
      $.admin_updateProfile,
    ]
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.manager_regionManager);
    const entry = await adapter.find($.manager_regionManager.parent, $.manager_regionManager.child);
    assert.deepEqual(entry, $.manager_regionManager);
  });

  it('should find many by parent', async () => {
    const entries = await adapter.findByParent($.admin_manager.parent);
    assert.deepEqual(entries, [$.admin_manager, $.admin_updateProfile]);
  });
});

describe('RbacHttpAdapter', function() {
  this.timeout(timeout);

  const $: RbacHierarchy = {
    assignments: [
      new RbacAssignment({ userId: 'alexey', role: 'admin' }),
      new RbacAssignment({ userId: 'ilya', role: 'manager' }),
    ],
    items: [
      new RbacItem({ type: 'role', name: 'admin' }),
      new RbacItem({ type: 'role', name: 'manager' }),
      new RbacItem({ type: 'role', name: 'user' }),
      new RbacItem({ type: 'rule', name: 'isOwnProfile' }),
      new RbacItem({ type: 'perm', name: 'updateProfile' }),
    ],
    itemChildren: [
      new RbacItemChild({ parent: 'admin', child: 'manager' }),
      new RbacItemChild({ parent: 'manager', child: 'user' }),
      new RbacItemChild({ parent: 'user', child: 'isOwnProfile' }),
      new RbacItemChild({ parent: 'isOwnProfile', child: 'updateProfile' }),
      new RbacItemChild({ parent: 'admin', child: 'updateProfile' }),
    ],
  };

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    app.get('/rbac/assignments', (_req, res) => {
      res.json($.assignments);
    });
    app.get('/rbac/items', (_req, res) => {
      res.json($.items);
    });
    app.get('/rbac/item-children', (_req, res) => {
      res.json($.itemChildren);
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter = new RbacAdapter({
    assignmentAdapter: new RbacHttpAssignmentAdapter({ client }),
    itemAdapter: new RbacHttpItemAdapter({ client }),
    itemChildAdapter: new RbacHttpItemChildAdapter({ client }),
  });

  it("should load data via load() function", async () => {
    const hierarchy = await adapter.load();
    assert.deepEqual(hierarchy, $);
  });
});
