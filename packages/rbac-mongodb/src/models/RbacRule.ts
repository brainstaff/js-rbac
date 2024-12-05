import { RbacRule } from "@brainstaff/rbac";
import mongoose from "mongoose";

const RbacRuleSchema = new mongoose.Schema<RbacRule>({
  name: {
    type: String,
    unique: true,
  },
});

export default mongoose.model("RbacRule", RbacRuleSchema, "RbacRule");
