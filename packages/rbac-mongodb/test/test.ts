import mongoose from 'mongoose';

import { RbacAssignment, RbacAssignmentAdapter, RbacItem, RbacItemAdapter, RbacItemChild, RbacItemChildAdapter } from '@brainstaff/rbac';

import { RbacMongodbAssignmentAdapter } from '../src/index.js';
import { RbacMongodbItemAdapter } from '../src/index.js';
import { RbacMongodbItemChildAdapter } from '../src/index.js';

interface Logger {
  info: (message: string) => void;
}

class MongooseConnection {
  private logger: Logger;
  
  constructor(uri: string, deps: {
    logger: Logger,
  }) {
    this.logger = deps.logger;
    mongoose.connect(uri);
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

  disconnect() {
    mongoose.disconnect();
  }
}

const mongooseConnection = new MongooseConnection(`mongodb://localhost:${process.env.MONGO_PORT}/rbac-test`, {
  logger: {
    info: (message: string) => console.log(message),
  },
});

const timeout = 10000;

let expect: Chai.ExpectStatic;

before(async () => {
  const chai = await import('chai');
  expect = chai.expect;
});

after(() => mongooseConnection.disconnect());

describe('RbacMongodbAssignmentAdapter', function() {
  this.timeout(timeout);

  const adapter: RbacAssignmentAdapter = new RbacMongodbAssignmentAdapter();

  const $ = {
    alexey: new RbacAssignment({ userId: 'alexey', role: 'admin' }),
    ilya: new RbacAssignment({ userId: 'ilya', role: 'manager' }),
    igor: new RbacAssignment({ userId: 'igor', role: 'manager' }),
  }

  it('should store many and load them', async () => {
    const values = [$.alexey, $.ilya];
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.igor);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    expect(entry).to.be.an('object').that.include($.igor);
  });

  it('should find many by user', async () => {
    const entries = await adapter.findByUserId($.igor.userId);
    expect(entries).to.have.deep.members([$.igor]);
  });

  it('should delete one and be unable to find it', async () => {
    await adapter.delete($.igor.userId, $.igor.role);
    const entry = await adapter.find($.igor.userId, $.igor.role);
    expect(entry).to.be.null;
    const all = await adapter.load();
    expect(all).to.have.deep.members([$.alexey, $.ilya]);
  });

  it('should delete many by user', async () => {
    await adapter.deleteByUser($.alexey.userId);
    const all = await adapter.load();
    expect(all).to.have.deep.members([$.ilya]);
  });
});

describe('RbacMongodbItemAdapter', function() {
  this.timeout(timeout);

  const adapter: RbacItemAdapter = new RbacMongodbItemAdapter();

  const $ = {
    admin: new RbacItem({ type: 'role', name: 'admin',  }),
    manager: new RbacItem({ type: 'role', name: 'manager' }),
    user: new RbacItem({ type: 'role', name: 'user' }),
    regionManager: new RbacItem({ type: 'role', name: 'region manager' }),
    isOwnProfile: new RbacItem({ type: 'rule', name: 'isOwnProfile' }),
    updateProfile: new RbacItem({ type: 'perm', name: 'updateProfile' }),
  }

  it('should store many and load them', async () => {
    const values = [$.admin, $.manager, $.user, $.updateProfile, $.isOwnProfile];
    await adapter.store(values);
    const entries = await adapter.load();
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.regionManager);
    const entry = await adapter.find($.regionManager.name);
    expect(entry).to.be.an('object').that.include($.regionManager);
  });

  it('should not create existing one', async () => {
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
    const entries = await adapter.findByType('role');
    expect(entries).to.have.deep.members([$.admin, $.manager, $.user, $.regionManager]);
  });
});

describe('RbacMongodbItemChildAdapter', function() {
  this.timeout(timeout);

  const adapter: RbacItemChildAdapter = new RbacMongodbItemChildAdapter();

  const $ = {
    admin_manager: new RbacItemChild({ parent: 'admin', child: 'manager' }),
    manager_user: new RbacItemChild({ parent: 'manager', child: 'user' }),
    user_isOwnProfile: new RbacItemChild({ parent: 'user', child: 'isOwnProfile' }),
    isOwnProfile_updateProfile: ({ parent: 'isOwnProfile', child: 'updateProfile' }),
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
    expect(entries).to.have.deep.members(values);
  });

  it('should create one and find it', async () => {
    await adapter.create($.manager_regionManager);
    const entry = await adapter.find($.manager_regionManager.parent, $.manager_regionManager.child);
    expect(entry).to.be.an('object').that.include($.manager_regionManager);
  });

  it('should find many by parent', async () => {
    const entry = await adapter.findByParent($.admin_manager.parent);
    expect(entry).to.have.deep.members([$.admin_manager, $.admin_updateProfile]);
  });
});
