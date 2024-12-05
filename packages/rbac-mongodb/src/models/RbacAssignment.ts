import { RbacAssignment } from "@brainstaff/rbac";
import mongoose from "mongoose";

const RbacAssignmentSchema = new mongoose.Schema<RbacAssignment>({
  userId: {
    type: String,
  },
  role: {
    type: String,
    ref: "RbacItem",
  },
  contextId: {
    type: String,
  },
});

export default mongoose.model(
  "RbacAssignment",
  RbacAssignmentSchema,
  "RbacAssignment",
);
