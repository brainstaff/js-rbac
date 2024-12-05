import { NullishBy } from "./utils";

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

export enum RbacItemTypeEnum {
  role = 'role',
  permission = 'permission',
}

export type RbacItemType = keyof typeof RbacItemTypeEnum;

export class RbacItem {
  type: RbacItemType;
  name: string;
  rule?: RbacRule['name'];

  constructor(v: NullishBy<RbacItem, 'rule'>) {
    this.type = v.type;
    this.name = v.name;
    this.rule = v.rule ?? undefined;
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

export type RbacAssignmnentContextId = string;

export const defaultRbacAssignmentContextId: RbacAssignmnentContextId = "";

export class RbacAssignment {
  userId: RbacUserId;
  role: RbacItem['name'];
  contextId: RbacAssignmnentContextId;

  constructor (v: NullishBy<RbacAssignment, 'contextId'>) {
    this.userId = v.userId;
    this.role = v.role;
    this.contextId = v.contextId ?? defaultRbacAssignmentContextId;
  }
}

export interface RbacHierarchy {
  assignments: RbacAssignment[];
  items: RbacItem[];
  itemChildren: RbacItemChild[];
  rules: RbacRule[];
}
