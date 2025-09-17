import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import queryRoutes from "./routes/queryRoutes.js";
import "./slackBot.js";

dotenv.config();
const app = express();
app.use(express.json());

app.use("/api/query", queryRoutes);

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Backend running on port ${process.env.PORT}`);
});
