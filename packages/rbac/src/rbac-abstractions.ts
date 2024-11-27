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

export class RbacAssignment {
  userId: RbacUserId;
  role: RbacItem['name'];

  constructor (v: RbacAssignment) {
    this.userId = v.userId;
    this.role = v.role;
  }
}
