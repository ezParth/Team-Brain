import mongoose from "mongoose";

const QueryLogSchema = new mongoose.Schema({
  question: String,
  answer: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("QueryLog", QueryLogSchema);
