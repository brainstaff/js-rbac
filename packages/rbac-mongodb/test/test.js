const { expect } = require('chai');

const { RbacMongodbAssignmentAdapter } = require('../dist');
const { RbacMongodbItemAdapter } = require('../dist');
const { RbacMongodbItemChildAdapter } = require('../dist');
const { RbacMongodbRuleAdapter } = require('../dist');
const { RbacMongodbConnection } = require('../dist');

const mongodbConfiguration = { uri: 'mongodb://localhost:27017/rbac-test' };
const logger = {
  info: (message) => console.log(message)
};

describe('RbacMongodbAssignmentAdapter', () => {
  const mongooseConnection = new RbacMongodbConnection({ mongodbConfiguration, logger });
  const rbacAssignments = [
    { userId: 'alexey', role: 'admin' },
    { userId: 'ilya', role: 'manager' }
  ];
  const timeout = 10000;

  const userAssignmets = { userId: 'igor', role: 'manager' };
  after(() => {
    mongooseConnection.disconnect();
  });

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
    const result = await adapter.create(userAssignmets.userId, userAssignmets.role);
    expect(result).to.be.an('object').that.include(userAssignmets);
  }).timeout(timeout);

  it('should find single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.find(userAssignmets.userId, userAssignmets.role);
    expect(result).to.be.an('object').that.include(userAssignmets);
  }).timeout(timeout);

  it('should find all assignments by user', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.findByUserId(userAssignmets.userId);
    expect(result).to.be.an('array').that.have.length(1);
    expect(result[0]).to.include(userAssignmets);
  }).timeout(timeout);

  it('should delete single assignments', async () => {
    const adapter = new RbacMongodbAssignmentAdapter(mongooseConnection);
    const result = await adapter.delete(userAssignmets.userId, userAssignmets.role);
    expect(result).to.be.an('object').that.include(userAssignmets);
    const remainData = await adapter.load();
    expect(remainData).to.be.an('array').that.have.length(2);
  }).timeout(timeout);
});