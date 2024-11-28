import assert from 'node:assert';

import { RbacAssignment, RbacAssignmentAdapter } from '@brainstaff/rbac';

import { RbacInMemoryAssignmentAdapter } from '../src/index.js';

describe('RbacInMemoryAssignmentAdapter', function() {
  const assignments: RbacAssignment[] = [];

  it('should be able to store data in memory', async () => {
    const assignmentAdapter: RbacAssignmentAdapter = new RbacInMemoryAssignmentAdapter();
    assert.deepEqual(await assignmentAdapter.load(), []);
    await assignmentAdapter.store(assignments);
    assert.deepEqual(await assignmentAdapter.load(), assignments);
  });
});
