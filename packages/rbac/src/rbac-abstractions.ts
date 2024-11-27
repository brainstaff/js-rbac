export type RbacUserId = string;

export class RbacRule {
  name: string;

  constructor(v: RbacRule) {
    this.name = v.name;
  }
}

export interface RbacRuleInstance<RbacRulePayload> {
  execute: (payload?: RbacRulePayload) => Promise<boolean>;
}

export interface RbacRuleFactory<RbacRulePayload> {
  createRule: (name: RbacRule['name']) => RbacRuleInstance<RbacRulePayload>;
}

export class RbacItem {
  type: 'role' | 'permission';
  name: string;
  rule?: RbacRule['name'];

  constructor(v: RbacItem) {
    this.type = v.type;
    this.name = v.name;
    this.rule = v.rule;
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

export class RbacAssignment<RbacContextId> {
  userId: RbacUserId;
  role: RbacItem['name'];
  contextIds?: RbacContextId[];

  constructor (v: RbacAssignment<RbacContextId>) {
    this.userId = v.userId;
    this.role = v.role;
    this.contextIds = v.contextIds;
  }
}

export interface RbacHierarchy<RbacContextId> {
  assignments: RbacAssignment<RbacContextId>[];
  items: RbacItem[];
  itemChildren: RbacItemChild[];
  rules: RbacRule[];
}
