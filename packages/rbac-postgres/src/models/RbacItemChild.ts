import { RbacItemChild } from "@brainstaff/rbac";
import { Model } from "objection";

import { ModelOf } from "../utils/model-of";

interface RbacItemChildModel extends ModelOf<RbacItemChild> {}

class RbacItemChildModel extends Model {
  static get tableName() {
    return "rbac_item_children";
  }

  static get idColumn() {
    return ["parent", "child"];
  }
}

export default RbacItemChildModel;
