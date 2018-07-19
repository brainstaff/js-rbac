const { expect } = require('chai');

const { RbacMongodbAssignmentAdapter } = require('../dist');
const { RbacMongodbItemAdapter } = require('../dist');
const { RbacMongodbItemChildAdapter } = require('../dist');
const { RbacMongodbRuleAdapter } = require('../dist');
const { RbacMongodbConnection } = require('../dist');

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
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.store(rbacAssignments);
    expect(result).to.be.an('array').that.have.length(2);
    expect(result[0]).to.include(rbacAssignments[0]);
    expect(result[1]).to.include(rbacAssignments[1]);
  }).timeout(timeout);

  it('should load all assignment', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(2);
    const members = [];
    result.forEach(item => members.push(item.userId));
    expect(members).to.have.members([rbacAssignments[0].userId, rbacAssignments[1].userId]);
  }).timeout(timeout);

  it('should create single assignment', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.create(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
  }).timeout(timeout);

  it('should find single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.find(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
  }).timeout(timeout);

  it('should find all assignments by user', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.findByUserId(rbacAssignmet.userId);
    expect(result).to.be.an('array').that.have.length(1);
    expect(result[0]).to.include(rbacAssignmet);
  }).timeout(timeout);

  it('should delete single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.delete(rbacAssignmet.userId, rbacAssignmet.role);
    expect(result).to.be.an('object').that.include(rbacAssignmet);
    const remainData = await adapter.load();
    expect(remainData).to.be.an('array').that.have.length(2);
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

  after(() => {
    mongooseConnection.disconnect();
  });

  it('should store many items', async () => {
    const adapter = new RbacMongodbItemAdapter(mongooseConnection);
    const result = await adapter.store(rbacItems);
    expect(result).to.be.an('array').that.have.length(5);
    result.forEach((item, index) => expect(item).to.include(rbacItems[index]));
  }).timeout(timeout);

  it('should load all items', async () => {
    const adapter = new RbacMongodbItemAdapter(mongooseConnection);
    const result = await adapter.load();
    expect(result).to.be.an('array').that.have.length(5);
    const members = [];
    result.forEach(item => members.push(item.name));
    expect(members).to.have.members(rbacItems.map(item => item.name));
  }).timeout(timeout);

  it('should create single item', async () => {
    const adapter = new RbacMongodbItemAdapter(mongooseConnection);
    const result = await adapter.create(rbacItem.name, rbacItem.type);
    expect(result).to.be.an('object').that.include(rbacItem);
  }).timeout(timeout);

  it('should find single item by name', async () => {
    const adapter = new RbacMongodbItemAdapter(mongooseConnection);
    const result = await adapter.find(rbacItem.name);
    expect(result).to.be.an('object').that.include(rbacItem);
  }).timeout(timeout);
});

