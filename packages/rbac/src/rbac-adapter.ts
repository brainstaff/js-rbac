import { RbacAssignment, RbacAssignmnentContextId, RbacHierarchy, RbacItem, RbacItemChild, RbacRule, RbacUserId } from "./rbac-abstractions";

export interface RbacAssignmentAdapter {
  store: (all: RbacAssignment[]) => Promise<void>;
  load: (contextId?: RbacAssignmnentContextId) => Promise<RbacAssignment[]>;
  create: (one: RbacAssignment) => Promise<void>;
  find: (userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId) => Promise<RbacAssignment | null>;
  findByUserId: (userId: RbacUserId, contextId?: RbacAssignmnentContextId) => Promise<RbacAssignment[]>;
  delete: (userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId) => Promise<void>;
  deleteByUser: (userId: RbacUserId, contextId?: RbacAssignmnentContextId) => Promise<void>;
}

export interface RbacItemAdapter {
  store: (all: RbacItem[]) => Promise<void>;
  load: () => Promise<RbacItem[]>;
  create: (one: RbacItem) => Promise<void>;
  find: (name: RbacItem['name']) => Promise<RbacItem | null>;
  findByType: (type: RbacItem['type']) => Promise<RbacItem[]>;
}

export interface RbacItemChildAdapter {
  store: (all: RbacItemChild[]) => Promise<void>;
  load: () => Promise<RbacItemChild[]>;
  create: (one: RbacItemChild) => Promise<void>;
  find: (parent: RbacItem['name'], child: RbacItem['name']) => Promise<RbacItemChild | null>;
  findByParent: (name: RbacItem['name']) => Promise<RbacItemChild[]>;
}

export interface RbacRuleAdapter {
  store: (all: RbacRule[]) => Promise<void>;
  load: () => Promise<RbacRule[]>;
  create: (one: RbacRule) => Promise<void>;
  find: (name: RbacRule['name']) => Promise<RbacRule | null>;
}
  
export class RbacAdapter {
  private assignmentAdapter: RbacAssignmentAdapter;
  private itemAdapter: RbacItemAdapter;
  private itemChildAdapter: RbacItemChildAdapter;
  private ruleAdapter: RbacRuleAdapter;

  constructor(deps: {
    assignmentAdapter: RbacAssignmentAdapter,
    itemAdapter: RbacItemAdapter,
    itemChildAdapter: RbacItemChildAdapter,
    ruleAdapter: RbacRuleAdapter,
  }) {
    this.assignmentAdapter = deps.assignmentAdapter;
    this.itemAdapter = deps.itemAdapter;
    this.itemChildAdapter = deps.itemChildAdapter;
    this.ruleAdapter = deps.ruleAdapter;
  }

  async store(all: RbacHierarchy): Promise<void> {
    await this.assignmentAdapter.store(all.assignments);
    await this.itemAdapter.store(all.items);
    await this.itemChildAdapter.store(all.itemChildren);
    await this.ruleAdapter.store(all.rules);
  }

  async load(): Promise<RbacHierarchy> {
    return {
      assignments: await this.assignmentAdapter.load(),
      items: await this.itemAdapter.load(),
      itemChildren: await this.itemChildAdapter.load(),
      rules: await this.ruleAdapter.load(),
    };
  }

  async findAllAssignments(contextId?: RbacAssignmnentContextId): Promise<RbacAssignment[]> {
    return this.assignmentAdapter.load(contextId);
  }

  async findAllItems(): Promise<RbacItem[]> {
    return this.itemAdapter.load();
  }

  async findAllItemsChild(): Promise<RbacItemChild[]> {
    return this.itemChildAdapter.load();
  }

  async findAllRules(): Promise<RbacRule[]> {
    return this.ruleAdapter.load();
  }

  // Core for checking access

  async findAssignmentsByUserId(userId: RbacUserId, contextId?: RbacAssignmnentContextId): Promise<RbacAssignment[]> {
    return this.assignmentAdapter.findByUserId(userId, contextId);
  }

  async findItem(name: RbacItem['name']): Promise<RbacItem | null | undefined> {
    return this.itemAdapter.find(name);
  }

  async findItemChildrenByParent(name: RbacItem['name']): Promise<RbacItemChild[]> {
    return this.itemChildAdapter.findByParent(name);
  }

  // Core for management

  async createAssignment(one: RbacAssignment): Promise<void> {
    return this.assignmentAdapter.create(one);
  }

  async findAssignment(userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId): Promise<RbacAssignment | null | undefined> {
    return this.assignmentAdapter.find(userId, role, contextId);
  }

  async findRoles(): Promise<RbacItem[]> {
    return this.itemAdapter.findByType('role');
  }

  async deleteAssignment(userId: RbacUserId, role: RbacItem['name'], contextId?: RbacAssignmnentContextId): Promise<void> {
    return this.assignmentAdapter.delete(userId, role, contextId);
  }

  async deleteAssignmentsByUser(userId: RbacUserId, contextId?: RbacAssignmnentContextId): Promise<void> {
    return this.assignmentAdapter.deleteByUser(userId, contextId);
  }

  // Management

  async createItem(one: RbacItem): Promise<void> {
    return this.itemAdapter.create(one);
  }

  async createItemChild(one: RbacItemChild): Promise<void> {
    return this.itemChildAdapter.create(one);
  }

  async createRule(one: RbacRule): Promise<void> {
    return this.ruleAdapter.create(one);
  }
}
