import assert from 'node:assert';

import { RbacAssignment, RbacAssignmentAdapter } from '@brainstaff/rbac';

import { RbacInMemoryAssignmentAdapter } from '../src/index.js';

describe('RbacInMemoryAssignmentAdapter', function() {
  const assignments: RbacAssignment<unknown>[] = [];

  it('should be able to store data in memory', async () => {
    const assignmentAdapter: RbacAssignmentAdapter<unknown> = new RbacInMemoryAssignmentAdapter();
    assert.deepEqual(await assignmentAdapter.load(), []);
    await assignmentAdapter.store(assignments);
    assert.deepEqual(await assignmentAdapter.load(), assignments);
  });
});
