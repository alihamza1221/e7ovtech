import mongoose, { Schema, Document, Types } from "mongoose";

interface TimeLog extends Document {
  user: Types.ObjectId;
  task: Types.ObjectId;
  workspace: Types.ObjectId;
  startTime: Date;
  endTime?: Date;
}

const timeLogSchema: Schema<TimeLog> = new Schema<TimeLog>({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  task: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  startTime: { type: Date, required: true, default: Date.now },
  endTime: { type: Date },
});

export const timeLogModel =
  (mongoose.models.TimeLog as mongoose.Model<TimeLog>) ||
  mongoose.model<TimeLog>("TimeLog", timeLogSchema);

export { timeLogSchema };
export type { TimeLog };
