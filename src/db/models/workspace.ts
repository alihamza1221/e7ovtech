import mongoose, { Schema, Document, Types } from "mongoose";
import { Role } from "./user";
interface Member {
  userId: Types.ObjectId;
  role: Role;
}
interface Workspace extends Document {
  name: string;
  admin: Types.ObjectId;
  members: Member[];
  tasks: Types.ObjectId[];
  description: string;
}
const memberSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: Object.values(Role), required: true },
});
const workspaceSchema: Schema<Workspace> = new Schema<Workspace>({
  name: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [memberSchema],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  description: { type: String, default: "" },
});

export const workspaceModel =
  (mongoose.models.Workspace as mongoose.Model<Workspace>) ||
  mongoose.model<Workspace>("Workspace", workspaceSchema);

export { workspaceSchema };
export type { Workspace };
