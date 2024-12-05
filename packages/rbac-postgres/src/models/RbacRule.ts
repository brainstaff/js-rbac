import { RbacRule } from "@brainstaff/rbac";
import { Model } from "objection";

import { ModelOf } from "../utils/model-of";

interface RbacRuleModel extends ModelOf<RbacRule> {}

class RbacRuleModel extends Model {
  static get tableName() {
    return "rbac_rules";
  }

  static get idColumn() {
    return "name";
  }
}

export default RbacRuleModel;
