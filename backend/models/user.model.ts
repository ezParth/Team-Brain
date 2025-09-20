import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string; // optional if you’re storing it
  email: string;
  groups: string[]; // list of group names
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String },
  email: { type: String },
  groups: [{ type: String }],
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
