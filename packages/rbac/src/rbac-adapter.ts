import { RbacAssignment, RbacHierarchy, RbacItem, RbacItemChild, RbacRule, RbacUserId } from "./rbac-abstractions";

export interface RbacAssignmentAdapter<RbacContextId> {
  store: (all: RbacAssignment<RbacContextId>[]) => Promise<void>;
  load: () => Promise<RbacAssignment<RbacContextId>[]>;
  create: (one: RbacAssignment<RbacContextId>) => Promise<void>;
  find: (userId: RbacUserId, item: RbacItem['name']) => Promise<RbacAssignment<RbacContextId> | null>;
  findByUserId: (userId: RbacUserId) => Promise<RbacAssignment<RbacContextId>[]>;
  delete: (userId: RbacUserId, role: RbacItem['name']) => Promise<void>;
  deleteByUser: (userId: RbacUserId) => Promise<void>;
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
  
export class RbacAdapter<RbacContextId> {
  private assignmentAdapter: RbacAssignmentAdapter<RbacContextId>;
  private itemAdapter: RbacItemAdapter;
  private itemChildAdapter: RbacItemChildAdapter;
  private ruleAdapter: RbacRuleAdapter;

  constructor(deps: {
    assignmentAdapter: RbacAssignmentAdapter<RbacContextId>,
    itemAdapter: RbacItemAdapter,
    itemChildAdapter: RbacItemChildAdapter,
    ruleAdapter: RbacRuleAdapter,
  }) {
    this.assignmentAdapter = deps.assignmentAdapter;
    this.itemAdapter = deps.itemAdapter;
    this.itemChildAdapter = deps.itemChildAdapter;
    this.ruleAdapter = deps.ruleAdapter;
  }

  async store(all: RbacHierarchy<RbacContextId>): Promise<void> {
    await this.assignmentAdapter.store(all.assignments);
    await this.itemAdapter.store(all.items);
    await this.itemChildAdapter.store(all.itemChildren);
    await this.ruleAdapter.store(all.rules);
  }

  async load(): Promise<RbacHierarchy<RbacContextId>> {
    return {
      assignments: await this.assignmentAdapter.load(),
      items: await this.itemAdapter.load(),
      itemChildren: await this.itemChildAdapter.load(),
      rules: await this.ruleAdapter.load(),
    };
  }

  async findAllAssignments(): Promise<RbacAssignment<RbacContextId>[]> {
    return this.assignmentAdapter.load();
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

  // Core for checkAccess

  async findAssignmentsByUserId(userId: RbacUserId): Promise<RbacAssignment<RbacContextId>[]> {
    return this.assignmentAdapter.findByUserId(userId);
  }

  async findItem(name: RbacItem['name']): Promise<RbacItem | null | undefined> {
    return this.itemAdapter.find(name);
  }

  async findItemChildrenByParent(name: RbacItem['name']): Promise<RbacItemChild[]> {
    return this.itemChildAdapter.findByParent(name);
  }

  // Core for management

  async createAssignment(one: RbacAssignment<RbacContextId>): Promise<void> {
    return this.assignmentAdapter.create(one);
  }

  async findAssignment(userId: RbacUserId, role: RbacItem['name']): Promise<RbacAssignment<RbacContextId> | null | undefined> {
    return this.assignmentAdapter.find(userId, role);
  }

  async findRoles(): Promise<RbacItem[]> {
    return this.itemAdapter.findByType('role');
  }

  async deleteAssignment(userId: RbacUserId, role?: RbacItem['name']): Promise<void> {
    if (role) {
      return this.assignmentAdapter.delete(userId, role);
    }
    return this.assignmentAdapter.deleteByUser(userId);
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
