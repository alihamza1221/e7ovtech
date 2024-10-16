import mongoose, { Schema, Document, Types } from "mongoose";

export enum Role {
  Admin = "Admin",
  TeamLead = "TeamLead",
  TeamMember = "TeamMember",
}

interface WorkspaceRole {
  workspace: Types.ObjectId;
  role: Role;
}

interface User extends Document {
  name: string;
  role?: Role;
  email: string;
  password: string;
  image: string;
  workspaces: WorkspaceRole[];
}

const workspaceRoleSchema: Schema<WorkspaceRole> = new Schema<WorkspaceRole>({
  workspace: {
    type: Schema.Types.ObjectId,
    ref: "Workspace",
  },
  role: { type: String, enum: Object.values(Role) },
});

const userSchema: Schema<User> = new Schema<User>({
  role: { type: String, enum: Object.values(Role), required: false },
  name: { type: String, required: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  image: { type: String },
  workspaces: [workspaceRoleSchema], // Array of workspaces with roles
});

export const userModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>("User", userSchema);

export { userSchema };
export type { User, WorkspaceRole };
