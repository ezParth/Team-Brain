import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

import userRoutes from "./routes/user.routes";
import groupRoutes from "./routes/group.routes";

import { isAuthenticated } from "./controllers/user.controller";

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

app.use("/user", userRoutes);
app.use("/group", groupRoutes);

app.get("/", (req: any, res: any) => {
  res.send("✅ Server is running...");
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Unauthorized: No token provided"));
  }

  try {
    const jwt = require("jsonwebtoken");
    const JWT_SECRET = process.env.JWT_SECRET || "tempJWT";
    const decoded = jwt.verify(token, JWT_SECRET);

    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 User connected: ${socket.data.user.username}`);

  socket.on("private_message", ({ toUserId, message }) => {
    console.log(
      `💬 Private message from ${socket.data.user.id} to ${toUserId}: ${message}`
    );
    io.to(toUserId).emit("private_message", {
      from: socket.data.user,
      message,
    });
  });

  socket.join(socket.data.user.id);

  socket.on("join_group", (groupId) => {
    socket.join(groupId);
    console.log(`👥 ${socket.data.user.username} joined group ${groupId}`);
  });

  socket.on("group_message", ({ groupId, message }) => {
    console.log(
      `👥 Group message in ${groupId} from ${socket.data.user.username}: ${message}`
    );
    io.to(groupId).emit("group_message", {
      from: socket.data.user,
      groupId,
      message,
    });
  });

  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.data.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/chat-team")
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("MongoDB connection error:", err));
