export type RbacUserId = string;

export interface RbacRuleInstance<RbacRulePayload> {
  execute: (payload?: RbacRulePayload) => Promise<boolean>;
}

export interface RbacRuleFactory<RbacRulePayload> {
  createRule: (name: string) => RbacRuleInstance<RbacRulePayload>;
}

export class RbacItem {
  type: 'role' | 'rule' | 'perm';
  name: string;

  constructor(v: RbacItem) {
    this.type = v.type;
    this.name = v.name;
  }
}

export class RbacItemChild {
  parent: RbacItem['name'];
  child: RbacItem['name'];

  constructor (v: RbacItemChild) {
    this.parent = v.parent;
    this.child = v.child;
  }
}

export class RbacAssignment<RbacContextId = never> {
  userId: RbacUserId;
  role: RbacItem['name'];
  contextIds?: RbacContextId[];

  constructor (v: RbacAssignment<RbacContextId>) {
    this.userId = v.userId;
    this.role = v.role;
    this.contextIds = v.contextIds;
  }
}

export interface RbacHierarchy<RbacContextId = never> {
  assignments: RbacAssignment<RbacContextId>[];
  items: RbacItem[];
  itemChildren: RbacItemChild[];
}
