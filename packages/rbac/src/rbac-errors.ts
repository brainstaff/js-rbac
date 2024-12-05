import {
  RbacAssignment,
  RbacItem,
  RbacItemChild,
  RbacRule,
} from "./rbac-abstractions";

export class RbacError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type RbacRuleAlreadyExistsErrorArgs = Pick<RbacRule, "name">;

export function buildRbacRuleAlreadyExistsErrorMessage({
  name,
}: RbacRuleAlreadyExistsErrorArgs) {
  return `Rule '${name}' already exists.`;
}

export class RbacRuleAlreadyExistsError extends RbacError {
  constructor(args: RbacRuleAlreadyExistsErrorArgs) {
    super(buildRbacRuleAlreadyExistsErrorMessage(args));
  }
}

type RbacItemAlreadyExistsErrorArgs = Pick<RbacItem, "name">;

export function buildRbacItemAlreadyExistsErrorMessage({
  name,
}: RbacItemAlreadyExistsErrorArgs) {
  return `Item '${name}' already exists.`;
}

export class RbacItemAlreadyExistsError extends RbacError {
  constructor(args: RbacItemAlreadyExistsErrorArgs) {
    super(buildRbacItemAlreadyExistsErrorMessage(args));
  }
}

type RbacItemChildAlreadyExistsErrorArgs = Pick<
  RbacItemChild,
  "parent" | "child"
>;

export function buildRbacItemChildAlreadyExistsErrorMessage({
  parent,
  child,
}: RbacItemChildAlreadyExistsErrorArgs) {
  return `Association of '${parent}' and '${child}' already exists.`;
}

export class RbacItemChildAlreadyExistsError extends RbacError {
  constructor(args: RbacItemChildAlreadyExistsErrorArgs) {
    super(buildRbacItemChildAlreadyExistsErrorMessage(args));
  }
}

type RbacAssignmentAlreadyExistsErrorArgs = Pick<
  RbacAssignment,
  "userId" | "role" | "contextId"
>;

export function buildRbacAssignmentAlreadyExistsErrorMessage({
  userId,
  role,
  contextId,
}: RbacAssignmentAlreadyExistsErrorArgs) {
  return `Role '${role}' is already assigned to user '${userId}' in context '${contextId}'.`;
}

export class RbacAssignmentAlreadyExistsError extends RbacError {
  constructor(args: RbacAssignmentAlreadyExistsErrorArgs) {
    super(buildRbacAssignmentAlreadyExistsErrorMessage(args));
  }
}

type RbacAssignmentNotFoundErrorArgs = Pick<
  RbacAssignment,
  "userId" | "role" | "contextId"
>;

export function buildRbacAssignmentNotFoundErrorMessage({
  userId,
  role,
  contextId,
}: RbacAssignmentNotFoundErrorArgs) {
  return `User '${userId}' has no item '${role}' assigned in context ${contextId ? `'${contextId}'` : "default"}.`;
}

export class RbacAssignmentNotFoundError extends RbacError {
  constructor(args: RbacAssignmentNotFoundErrorArgs) {
    super(buildRbacAssignmentNotFoundErrorMessage(args));
  }
}
