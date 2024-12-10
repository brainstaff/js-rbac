import assert from "node:assert";
import http from "node:http";

import {
  buildRbacAssignmentNotFoundErrorMessage,
  buildRbacItemAlreadyExistsErrorMessage,
  RbacAdapter,
  RbacAssignment,
  RbacAssignmentAdapter,
  RbacHierarchy,
  RbacItem,
  RbacItemAdapter,
  RbacItemChild,
  RbacItemChildAdapter,
  RbacRule,
  RbacRuleAdapter,
} from "@brainstaff/rbac";
import {
  RbacInMemoryAssignmentAdapter,
  RbacInMemoryItemAdapter,
  RbacInMemoryItemChildAdapter,
  RbacInMemoryRuleAdapter,
} from "@brainstaff/rbac-in-memory";
import express from "express";

import { assignmentsUrl } from "../src/adapters/RbacHttpAssignmentAdapter.js";
import { itemsUrl } from "../src/adapters/RbacHttpItemAdapter.js";
import { itemChildrenUrl } from "../src/adapters/RbacHttpItemChildAdapter.js";
import { rulesUrl } from "../src/adapters/RbacHttpRuleAdapter.js";
import {
  RbacHttpAssignmentAdapter,
  RbacHttpItemAdapter,
  RbacHttpItemChildAdapter,
  RbacHttpRuleAdapter,
} from "../src/index.js";

const baseURL = "http://localhost:4001";

const timeout = 10000;

const newErrHandler = (res: express.Response) => {
  return (err: unknown) => {
    res.status(typeof err === "number" ? err : 400).json({
      message: err instanceof Error ? err.message : "No message.",
    });
  };
};

describe("RbacHttpAssignmentAdapter", function () {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryAssignmentAdapter();
    app.post(assignmentsUrl, (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacAssignments, userId, role } = req.body;
      if (rbacAssignments) {
        db.store(rbacAssignments)
          .then(() => res.end())
          .catch(errHandler);
      } else {
        db.create(new RbacAssignment({ userId, role }))
          .then(() => res.end())
          .catch(errHandler);
      }
    });
    app.get(assignmentsUrl, (req, res) => {
      const handleErr = newErrHandler(res);
      db.load()
        .then((entries) => res.json(entries))
        .catch(handleErr);
    });
    app.get(`${assignmentsUrl}/:userId/:role`, (req, res) => {
      const handleErr = newErrHandler(res);
      const { userId, role } = req.params;
      const { contextId } = req.query;
      if (typeof contextId !== "string" || typeof contextId === "undefined") {
        return handleErr(400);
      }
      db.find(userId, role, contextId)
        .then((entry) => res.json(entry))
        .catch(handleErr);
    });
    app.get(`${assignmentsUrl}/:userId`, (req, res) => {
      const handleErr = newErrHandler(res);
      const { userId } = req.params;
      const { contextId } = req.query;
      if (typeof contextId !== "string" || typeof contextId === "undefined") {
        return handleErr(400);
      }
      db.findByUserId(userId, contextId)
        .then((entry) => res.json(entry))
        .catch(handleErr);
    });
    app.delete(`${assignmentsUrl}/:userId/:role`, (req, res) => {
      const handleErr = newErrHandler(res);
      const { userId, role } = req.params;
      const { contextId } = req.query;
      if (typeof contextId !== "string" || typeof contextId === "undefined") {
        return handleErr(400);
      }
      db.delete(userId, role, contextId)
        .then(() => res.send())
        .catch(handleErr);
    });
    app.delete(`${assignmentsUrl}/:userId`, (req, res) => {
      const handleErr = newErrHandler(res);
      const { userId } = req.params;
      const { contextId } = req.query;
      if (typeof contextId !== "string" || typeof contextId === "undefined") {
        return handleErr(400);
      }
      db.deleteByUser(userId, contextId)
        .then(() => res.send())
        .catch(handleErr);
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacAssignmentAdapter = new RbacHttpAssignmentAdapter(baseURL);

  const $ = {
    alexey: new RbacAssignment({ userId: "alexey", role: "admin" }),
    ilya: new RbacAssignment({ userId: "ilya", role: "manager" }),
    igor: new RbacAssignment({ userId: "igor", role: "manager" }),
  };

  it("should store many and load them", async () => {
    const values = [$.alexey, $.ilya];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it("should create one and find it", async () => {
    await adapter.create($.igor);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    assert.deepEqual(entry, $.igor);
  });

  it("should find many by user", async () => {
    const entries = await adapter.findByUserId($.igor.userId);
    assert.deepEqual(entries, [$.igor]);
  });

  it("should delete one and be unable to find it", async () => {
    await adapter.delete($.igor.userId, $.igor.role);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    assert.deepEqual(entry, null);
    const all = await adapter.load();
    assert.deepEqual(all, [$.alexey, $.ilya]);
  });

  it("should not delete missing one", async () => {
    try {
      await adapter.delete($.igor.userId, $.igor.role);
      assert.fail("Should throw error.");
    } catch (err) {
      if (err instanceof Error) {
        assert.deepEqual(
          err.message,
          buildRbacAssignmentNotFoundErrorMessage($.igor),
        );
      } else {
        assert.fail("Thrown error should inherit from Error.");
      }
    }
  });

  it("should delete many by user", async () => {
    await adapter.deleteByUser($.alexey.userId);
    const all = await adapter.load();
    assert.deepEqual(all, [$.ilya]);
  });
});

describe("RbacHttpItemAdapter", function () {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryItemAdapter();
    app.post(itemsUrl, (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacItems, name, type, rule } = req.body;
      if (rbacItems) {
        db.store(rbacItems)
          .then(() => res.end())
          .catch(errHandler);
      } else {
        db.create({ name, type, rule })
          .then(() => res.end())
          .catch(errHandler);
      }
    });
    app.get(itemsUrl, (_req, res) => {
      db.load()
        .then((entries) => res.json(entries))
        .catch(newErrHandler(res));
    });
    app.get(`${itemsUrl}/roles`, (_req, res) => {
      db.findByType("role")
        .then((entries) => res.json(entries))
        .catch(newErrHandler(res));
    });
    app.get(`${itemsUrl}/:name`, (req, res) => {
      db.find(req.params.name)
        .then((entry) => res.json(entry))
        .catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacItemAdapter = new RbacHttpItemAdapter(baseURL);

  const $ = {
    admin: new RbacItem({ name: "admin", type: "role" }),
    manager: new RbacItem({ name: "manager", type: "role" }),
    user: new RbacItem({ name: "user", type: "role" }),
    updateProfile: new RbacItem({ name: "updateProfile", type: "permission" }),
    updateOwnProfile: new RbacItem({
      name: "updateOwnProfile",
      type: "permission",
      rule: "IsOwnProfile",
    }),
    regionManager: new RbacItem({ name: "region manager", type: "role" }),
  };

  it("should store many and load them", async () => {
    const values = [
      $.admin,
      $.manager,
      $.user,
      $.updateProfile,
      $.updateOwnProfile,
    ];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it("should create one and find it", async () => {
    await adapter.create($.regionManager);
    const entry = await adapter.find($.regionManager.name);
    assert.deepEqual(entry, $.regionManager);
  });

  it("should not create existing one", async () => {
    try {
      await adapter.create($.regionManager);
      assert.fail("Should throw error.");
    } catch (err) {
      if (err instanceof Error) {
        assert.equal(
          err.message,
          buildRbacItemAlreadyExistsErrorMessage($.regionManager),
        );
      } else {
        assert.fail("Thrown error should inherit from Error.");
      }
    }
  });

  it("should find all roles", async () => {
    const entries = await adapter.findByType("role");
    assert.deepEqual(entries, [$.admin, $.manager, $.user, $.regionManager]);
  });
});

describe("RbacHttpItemChildAdapter", function () {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryItemChildAdapter();
    app.post(itemChildrenUrl, (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacItemChildren, parent, child } = req.body;
      if (rbacItemChildren) {
        db.store(rbacItemChildren)
          .then(() => res.end())
          .catch(errHandler);
      } else {
        db.create({ parent, child })
          .then(() => res.end())
          .catch(errHandler);
      }
    });
    app.get(itemChildrenUrl, (_req, res) => {
      db.load()
        .then((entries) => res.json(entries))
        .catch(newErrHandler(res));
    });
    app.get(`${itemChildrenUrl}/:parent/:child`, (req, res) => {
      db.find(req.params.parent, req.params.child)
        .then((entries) => res.json(entries))
        .catch(newErrHandler(res));
    });
    app.get(`${itemChildrenUrl}/:parent`, (req, res) => {
      db.findByParent(req.params.parent)
        .then((entry) => res.json(entry))
        .catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacItemChildAdapter = new RbacHttpItemChildAdapter(baseURL);

  const $ = {
    admin_manager: new RbacItemChild({ parent: "admin", child: "manager" }),
    manager_user: new RbacItemChild({ parent: "manager", child: "user" }),
    user_updateOwnProfile: new RbacItemChild({
      parent: "user",
      child: "updateOwnProfile",
    }),
    updateOwnProfile_updateProfile: new RbacItemChild({
      parent: "updateOwnProfile",
      child: "updateProfile",
    }),
    admin_updateProfile: new RbacItemChild({
      parent: "admin",
      child: "updateProfile",
    }),
    manager_regionManager: new RbacItemChild({
      parent: "manager",
      child: "region manager",
    }),
  };

  it("should store many and load them", async () => {
    const values = [
      $.admin_manager,
      $.manager_user,
      $.user_updateOwnProfile,
      $.updateOwnProfile_updateProfile,
      $.admin_updateProfile,
    ];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it("should create one and find it", async () => {
    await adapter.create($.manager_regionManager);
    const entry = await adapter.find(
      $.manager_regionManager.parent,
      $.manager_regionManager.child,
    );
    assert.deepEqual(entry, $.manager_regionManager);
  });

  it("should find many by parent", async () => {
    const entries = await adapter.findByParent($.admin_manager.parent);
    assert.deepEqual(entries, [$.admin_manager, $.admin_updateProfile]);
  });
});

describe("RbacHttpRuleAdapter", function () {
  this.timeout(timeout);

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    const db = new RbacInMemoryRuleAdapter();
    app.post(rulesUrl, (req, res) => {
      const errHandler = newErrHandler(res);
      const { rbacRules, name } = req.body;
      if (rbacRules) {
        db.store(rbacRules)
          .then(() => res.end())
          .catch(errHandler);
      } else {
        db.create({ name })
          .then(() => res.end())
          .catch(errHandler);
      }
    });
    app.get(rulesUrl, (_req, res) => {
      db.load()
        .then((entries) => res.json(entries))
        .catch(newErrHandler(res));
    });
    app.get(`${rulesUrl}/:name`, (req, res) => {
      db.find(req.params.name)
        .then((entry) => res.json(entry))
        .catch(newErrHandler(res));
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter: RbacRuleAdapter = new RbacHttpRuleAdapter(baseURL);

  const $ = {
    IsOwnProfile: new RbacRule({ name: "IsOwnProfile" }),
    IsOwnDocument: new RbacRule({ name: "IsOwnDocument" }),
    IsGroupLeader: new RbacRule({ name: "IsGroupLeader" }),
  };

  it("should store many and load them", async () => {
    const values = [$.IsOwnProfile, $.IsOwnDocument];
    await adapter.store(values);
    const entries = await adapter.load();
    assert.deepEqual(entries, values);
  });

  it("should create one and find it", async () => {
    await adapter.create($.IsGroupLeader);
    const entry = await adapter.find($.IsGroupLeader.name);
    assert.deepEqual(entry, $.IsGroupLeader);
  });
});

describe("RbacHttpAdapter", function () {
  this.timeout(timeout);

  const $: RbacHierarchy = {
    assignments: [
      new RbacAssignment({ userId: "alexey", role: "admin" }),
      new RbacAssignment({ userId: "ilya", role: "manager" }),
    ],
    items: [
      new RbacItem({ name: "admin", type: "role" }),
      new RbacItem({ name: "manager", type: "role" }),
      new RbacItem({ name: "user", type: "role" }),
      new RbacItem({ name: "updateProfile", type: "permission" }),
      new RbacItem({
        name: "updateOwnProfile",
        type: "permission",
        rule: "IsOwnProfile",
      }),
    ],
    itemChildren: [
      new RbacItemChild({ parent: "admin", child: "manager" }),
      new RbacItemChild({ parent: "manager", child: "user" }),
      new RbacItemChild({ parent: "user", child: "updateOwnProfile" }),
      new RbacItemChild({ parent: "updateOwnProfile", child: "updateProfile" }),
      new RbacItemChild({ parent: "admin", child: "updateProfile" }),
    ],
    rules: [new RbacRule({ name: "IsOwnProfile" })],
  };

  let server: http.Server;

  before(async () => {
    const app = express();
    server = app.listen(4001);
    app.use(express.json());
    app.get(assignmentsUrl, (_req, res) => {
      res.json($.assignments);
    });
    app.get(itemsUrl, (_req, res) => {
      res.json($.items);
    });
    app.get(itemChildrenUrl, (_req, res) => {
      res.json($.itemChildren);
    });
    app.get(rulesUrl, (_req, res) => {
      res.json($.rules);
    });
  });

  after((done) => {
    server.close(done);
  });

  const adapter = new RbacAdapter({
    assignmentAdapter: new RbacHttpAssignmentAdapter(baseURL),
    itemAdapter: new RbacHttpItemAdapter(baseURL),
    itemChildAdapter: new RbacHttpItemChildAdapter(baseURL),
    ruleAdapter: new RbacHttpRuleAdapter(baseURL),
  });

  it("should load data via load() function", async () => {
    const hierarchy = await adapter.load();
    assert.deepEqual(hierarchy, $);
  });
});
