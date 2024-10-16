import mongoose, { Schema, Document, Types } from "mongoose";

interface Workspace extends Document {
  name: string;
  admin: Types.ObjectId;
  members: Types.ObjectId[];
  tasks: Types.ObjectId[];
  description: string;
}

const workspaceSchema: Schema<Workspace> = new Schema<Workspace>({
  name: { type: String, required: true },
  admin: { type: Schema.Types.ObjectId, ref: "User", required: true },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  tasks: [{ type: Schema.Types.ObjectId, ref: "Task" }],
  description: { type: String, default: "" },
});

export const workspaceModel =
  (mongoose.models.Workspace as mongoose.Model<Workspace>) ||
  mongoose.model<Workspace>("Workspace", workspaceSchema);

export { workspaceSchema };
export type { Workspace };
