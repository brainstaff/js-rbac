import { RbacItemChild } from "@brainstaff/rbac";
import mongoose from "mongoose";

const RbacItemChildSchema = new mongoose.Schema<RbacItemChild>({
  parent: {
    type: String,
    ref: "RbacItem",
  },
  child: {
    type: String,
    ref: "RbacItem",
  },
});

export default mongoose.model(
  "RbacItemChild",
  RbacItemChildSchema,
  "RbacItemChild",
);
