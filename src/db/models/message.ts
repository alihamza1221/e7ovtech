import mongoose, { Schema, Document, Types } from "mongoose";

interface Message extends Document {
  sender: Types.ObjectId;
  workspace: Types.ObjectId;
  content: string;
  timestamp: Date;
}

const messageSchema: Schema<Message> = new Schema<Message>({
  sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workspace: { type: Schema.Types.ObjectId, ref: "Workspace", required: true },
  content: { type: String, required: true, default: "" },
  timestamp: { type: Date, default: Date.now },
});

export const messageModel =
  (mongoose.models?.Message as mongoose.Model<Message>) ||
  mongoose.model<Message>("Message", messageSchema);

export { messageSchema };
export type { Message };
