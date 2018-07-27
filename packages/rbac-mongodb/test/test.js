const { expect } = require('chai');

const { RbacMongodbAssignmentAdapter } = require('../dist');
const { RbacMongodbItemAdapter } = require('../dist');
const { RbacMongodbItemChildAdapter } = require('../dist');
const { RbacMongodbRuleAdapter } = require('../dist');
const mongoose = require('mongoose');

class RbacMongodbConnection{
  constructor({mongodbConfiguration, logger}) {
    this.mongodbConfiguration = mongodbConfiguration;
    this.logger = logger;
    mongoose.connect(this.mongodbConfiguration.uri, this.mongodbConfiguration.options);

    mongoose.connection.on('reconnectFailed', () => {
      this.logger.info('Mongoose reconnection failed.');
    });
    mongoose.connection.on('connected', () => {
      this.logger.info('Established connection to Mongodb');
    });
    mongoose.connection.on('error', () => {
      this.logger.info('Error connecting to Mongodb');
      mongoose.disconnect();
    });
    mongoose.connection.on('disconnected', () => {
      this.logger.info('Disconnected from Mongodb');
    });
  }

  disconnect(){
    mongoose.disconnect();
  }
}

const mongodbConfiguration = {
  uri: 'mongodb://localhost:27017/rbac-test', options: { useNewUrlParser: true }
};

const logger = {
  info: (message) => console.log(message)
};

const mongooseConnection = new RbacMongodbConnection({ mongodbConfiguration, logger });
const timeout = 10000;

describe('RbacMongodbAssignmentAdapter', () => {
  const rbacAssignments = [
    { userId: 'alexey', role: 'admin' },
    { userId: 'ilya', role: 'manager' }
  ];

  const rbacAssignmet = { userId: 'igor', role: 'manager' };

  it('should store many assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.store(rbacAssignments);
    expect(result).to.be.an('array').that.have.length(2);
    expect(result[0]).to.include(rbacAssignments[0]);
    expect(result[1]).to.include(rbacAssignments[1]);
  }).timeout(timeout);

  it('should load all assignment', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(2);
    const members = [];
    result.forEach(item => members.push(item.userId));
    expect(members).to.have.members([rbacAssignments[0].userId, rbacAssignments[1].userId]);
  }).timeout(timeout);

  it('should create single assignment', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.create(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
  }).timeout(timeout);

  it('should find single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.find(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
  }).timeout(timeout);

  it('should find all assignments by user', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.findByUserId(rbacAssignmet.userId);
    expect(result).to.be.an('array').that.have.length(1);
    expect(result[0]).to.include(rbacAssignmet);
  }).timeout(timeout);

  it('should delete single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.delete(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
    const remainData = await adapter.load();
    expect(remainData).to.be.an('array').that.have.length(2);
  }).timeout(timeout);

  it('should delete all assignments by user', async () => {
    const adapter = new RbacMongodbAssignmentAdapter();
    const result = await adapter.deleteByUser(rbacAssignments[0].userId);
    expect(result).to.be.an('object').that.include({ n: 1, ok: 1 });
    const remainData = await adapter.load();
    expect(remainData).to.be.an('array').that.have.length(1);
  }).timeout(timeout);
});

describe('RbacMongodbItemAdapter', () => {
  const rbacItems = [
    { name: 'admin', type: 'role' },
    { name: 'manager', type: 'role' },
    { name: 'user', type: 'role' },
    { name: 'updateProfile', type: 'permission' },
    { name: 'updateOwnProfile', type: 'permission', rule: 'IsOwnProfile' }
  ];
  const rbacItem = { name: 'region manager', type: 'role' };

  it('should store many items', async () => {
    const adapter = new RbacMongodbItemAdapter();
    const result = await adapter.store(rbacItems);
    expect(result).to.be.an('array').that.have.length(5);
    result.forEach((item, index) => expect(item).to.include(rbacItems[index]));
  }).timeout(timeout);

  it('should load all items', async () => {
    const adapter = new RbacMongodbItemAdapter();
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(5);
    const members = [];
    result.forEach(item => members.push(item.name));
    expect(members).to.have.members(rbacItems.map(item => item.name));
  }).timeout(timeout);

  it('should load all roles', async () => {
    const adapter = new RbacMongodbItemAdapter();
    const result = await adapter.findByType('role');
    expect(result).to.be.an('array').that.have.length(3);
    const members = [];
    result.forEach(item => members.push(item.name));
    expect(members).to.have.members(rbacItems.reduce((result, item) => {
      if (item.type === 'role') {
        result.push(item.name);
      }
      return result;
    }, []));
  }).timeout(timeout);

  it('should create single item', async () => {
    const adapter = new RbacMongodbItemAdapter();
    const result = await adapter.create(rbacItem.name, rbacItem.type);
    expect(result).to.be.an('object').that.include(rbacItem);
  }).timeout(timeout);

  it('should find single item by name', async () => {
    const adapter = new RbacMongodbItemAdapter();
    const result = await adapter.find(rbacItem.name);
    expect(result).to.be.an('object').that.include(rbacItem);
  }).timeout(timeout);
});

describe('RbacMongodbItemChildAdapter', () => {
  const rbacItemChildren = [
    { parent: 'admin', child: 'manager' },
    { parent: 'manager', child: 'user' },
    { parent: 'user', child: 'updateOwnProfile' },
    { parent: 'updateOwnProfile', child: 'updateProfile' },
    { parent: 'admin', child: 'updateProfile' }
  ];
  const rbacItemChild = { parent: 'manager', child: 'region manager' };

  it('should store many children items', async () => {
    const adapter = new RbacMongodbItemChildAdapter();
    const result = await adapter.store(rbacItemChildren);
    expect(result).to.be.an('array').that.have.length(5);
    result.forEach((item, index) => expect(item).to.include(rbacItemChildren[index]));
  }).timeout(timeout);

  it('should load all child items', async () => {
    const adapter = new RbacMongodbItemChildAdapter();
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(5);
    const members = [];
    result.forEach(item => members.push(item.parent));
    expect(members).to.have.members(rbacItemChildren.map(item => item.parent));
  }).timeout(timeout);

  it('should create single child item', async () => {
    const adapter = new RbacMongodbItemChildAdapter();
    const result = await adapter.create(rbacItemChild.parent, rbacItemChild.child);
    expect(result).to.be.an('object').that.include(rbacItemChild);
  }).timeout(timeout);

  it('should find all children item by parent', async () => {
    const adapter = new RbacMongodbItemChildAdapter();
    const result = await adapter.findByParent(rbacItemChildren[0].parent);
    expect(result).to.be.an('array').that.have.length(2);
  }).timeout(timeout);
});

describe('RbacMongodbRuleAdapter', () => {
  const rbacRules = [
    { name: 'IsOwnProfile' },
    { name: 'IsOwnDocument' }
  ];
  const rbacRule = { name: 'IsGroupLeader' };

  after(() => {
    mongooseConnection.disconnect();
  });

  it('should store many rules', async () => {
    const adapter = new RbacMongodbRuleAdapter();
    const result = await adapter.store(rbacRules);
    expect(result).to.be.an('array').that.have.length(2);
    result.forEach((item, index) => expect(item).to.include(rbacRules[index]));
  }).timeout(timeout);

  it('should load all rules', async () => {
    const adapter = new RbacMongodbRuleAdapter();
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(2);
    const members = [];
    result.forEach(item => members.push(item.name));
    expect(members).to.have.members(rbacRules.map(item => item.name));
  }).timeout(timeout);

  it('should create single rule', async () => {
    const adapter = new RbacMongodbRuleAdapter();
    const result = await adapter.create(rbacRule.name);
    expect(result).to.be.an('object').that.include(rbacRule);
  }).timeout(timeout);
});

