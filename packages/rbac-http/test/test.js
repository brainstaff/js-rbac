const assert = require('assert');
const express = require('express');

const { RbacHttpAssignmentAdapter } = require("../dist");
const { RbacHttpItemAdapter } = require("../dist");
const { RbacHttpItemChildAdapter } = require("../dist");
const { RbacHttpRuleAdapter } = require("../dist");

describe('RbacHttpAssignmentAdapter', () => {
  const rbacAssignments = [
    { userId: 'alexey', role: 'admin' },
    { userId: 'ilya', role: 'manager' }
  ];
  const assignmentAdapter = new RbacHttpAssignmentAdapter({
    baseUrl: 'http://localhost:4000',
    headers: {}
  });
  let server;

  before(async () => {
    const app = express();
    server = app.listen(4000);
    app.use(express.json());
    app.get('/rbac/assignments/:userId/:role', (request, response) => {
      response.json(rbacAssignments.find((assignment) => {
        return assignment.userId === request.params.userId &&
          assignment.role === request.params.role;
      }));
    });
    app.get('/rbac/assignments', (request, response) => {
      response.json({ rbacAssignments });
    });
    app.post('/rbac/assignments', (request, response) => {
      response.json(request.body);
    });
  });

  after((done) => {
    server.close(done);
  });

  it('should load data via http', async () => {
    const response = await assignmentAdapter.load();
    assert.deepEqual(response.data.rbacAssignments, rbacAssignments);
  });

  it('should store data over http', async () => {
    const response = await assignmentAdapter.store(rbacAssignments);
    assert.deepEqual(response.data.rbacAssignments, rbacAssignments);
  });

  it('should create user assignment', async () => {
    const assignment = { userId: 'alexey', role: 'admin' };
    const response = await assignmentAdapter.create(assignment.userId, assignment.role);
    assert.deepEqual(response.data, assignment);
  });

  it('should find exact assignment', async () => {
    const assignment = { userId: 'alexey', role: 'admin' };
    const response = await assignmentAdapter.find(assignment.userId, assignment.role);
    assert.deepEqual(response.data, assignment);
  });
});

describe('RbacHttpItemAdapter', () => {
  const rbacItems = [
    { name: 'admin', type: 'role' },
    { name: 'manager', type: 'role' },
    { name: 'user', type: 'role' },
    { name: 'updateProfile', type: 'permission' },
    { name: 'updateOwnProfile', type: 'permission', rule: 'IsOwnProfile' },
  ];
  let server;

  before(async () => {
    const app = express();
    server = app.listen(4000);
    app.get('/rbac/items', (request, response) => {
      response.json({ rbacItems });
    })
  });

  after((done) => {
    server.close(done);
  });

  it('should load data via http', async () => {
    const itemAdapter = new RbacHttpItemAdapter({
      baseUrl: 'http://localhost:4000',
      headers: {}
    });
    const response = await itemAdapter.load();
    assert.deepEqual(response.data.rbacItems, rbacItems);
  });
});

describe('RbacHttpItemChildAdapter', () => {
  const rbacItemChildren = [
    { parent: 'admin', child: 'manager' },
    { parent: 'manager', child: 'user' },
    { parent: 'user', child: 'updateOwnProfile' },
    { parent: 'updateOwnProfile', child: 'updateProfile' },
    { parent: 'admin', child: 'updateProfile' }
  ];
  let server;

  before(async () => {
    const app = express();
    server = app.listen(4000);
    app.get('/rbac/item-children', (request, response) => {
      response.json({ rbacItemChildren });
    })
  });

  after((done) => {
    server.close(done);
  });

  it('should load data via http', async () => {
    const itemChildAdapter = new RbacHttpItemChildAdapter({
      baseUrl: 'http://localhost:4000',
      headers: {}
    });
    const response = await itemChildAdapter.load();
    assert.deepEqual(response.data.rbacItemChildren, rbacItemChildren);
  });
});

describe('RbacHttpRuleAdapter', () => {
  const rbacRules = [
    { name: 'IsOwnProfile' }
  ];
  let server;

  before(async () => {
    const app = express();
    server = app.listen(4000);
    app.get('/rbac/rules', (request, response) => {
      response.json({ rbacRules });
    })
  });

  after((done) => {
    server.close(done);
  });

  it('should load data via http', async () => {
    const ruleAdapter = new RbacHttpRuleAdapter({
      baseUrl: 'http://localhost:4000',
      headers: {}
    });
    const response = await ruleAdapter.load();
    assert.deepEqual(response.data.rbacRules, rbacRules);
  });
});
