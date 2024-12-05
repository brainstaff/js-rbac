import { RbacItem } from "@brainstaff/rbac";
import { Model } from "objection";

import { ModelOf } from "../utils/model-of";

interface RbacItemModel extends ModelOf<RbacItem> {}

class RbacItemModel extends Model {
  static get tableName() {
    return "rbac_items";
  }

  static get idColumn() {
    return "name";
  }
}

export default RbacItemModel;
