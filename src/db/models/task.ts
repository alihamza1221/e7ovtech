import mongoose, { Schema, Document, Types } from "mongoose";

enum Priority {
  Important = "important",
  Moderate = "moderate",
  Normal = "normal",
}

enum TaskStatus {
  Pending = "Pending",
  InProgress = "InProgress",
  Completed = "Completed",
}

interface Task extends Document {
  label: string;
  priority: Priority;
  status: TaskStatus;
  deadLine: Date;
  createdAt: Date;
  assignedTo: Types.ObjectId;
  workspace: Types.ObjectId;
  description?: string;
}

const taskSchema: Schema<Task> = new Schema<Task>({
  label: { type: String, required: true },
  priority: {
    type: String,
    enum: Object.values(Priority),
    required: true,
    default: Priority.Normal,
  },
  status: {
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.Pending,
  },
  deadLine: { type: Date, required: true },
  createdAt: { type: Date, required: true, default: Date.now },
  assignedTo: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    default: null,
  },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  description: { type: String },
});

export const taskModel =
  (mongoose.models?.Task as mongoose.Model<Task>) ||
  mongoose.model<Task>("Task", taskSchema);

export { taskSchema, Priority, TaskStatus };
export type { Task };
