import mongoose, { Schema, Document } from "mongoose";

export interface IChat {
  sender: string;
  receiver: string; // group name
  message: string;
  status: string;
  time: string;
}

export interface IUserRef {
  username: string;
}

export interface IGroup extends Document {
  groupName: string;
  admin: IUserRef;
  members: IUserRef[];
  avatar?: string;
  messages: IChat[];
  online: string[];
}

const ChatSchema = new Schema<IChat>({
  sender: { type: String, required: true },
  receiver: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: "sent" },
  time: { type: String, required: true },
});

const UserRefSchema = new Schema<IUserRef>({
  username: { type: String, required: true },
});

const GroupSchema = new Schema<IGroup>({
  groupName: { type: String, required: true, unique: true },
  admin: { type: UserRefSchema, required: true },
  members: { type: [UserRefSchema], default: [] },
  avatar: { type: String },
  messages: { type: [ChatSchema], default: [] },
  online: { type: [String], default: [] },
});

export const GroupModel = mongoose.model<IGroup>("Group", GroupSchema);
