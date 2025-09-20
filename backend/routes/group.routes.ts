import { Router } from "express";
import {
  createGroup,
  joinGroup,
  getGroupsByUser,
  deleteGroup,
  saveGroupChat,
  getGroupChat,
  getGroupAvatar,
  getGroupMembersAndAdmin,
  addUserOnline,
  removeUserOnline,
  getOnlineUsers,
} from "../controllers/group.controller";

const router = Router();

// routes
router.post("/create", createGroup);
router.post("/join", joinGroup);
router.get("/getGroups", getGroupsByUser);
router.delete("/delete", deleteGroup);
router.post("/chat/save", saveGroupChat);
router.get("/chats/:groupName", getGroupChat);
router.get("/avatar/:groupName", getGroupAvatar);
router.get("/members/:groupName", getGroupMembersAndAdmin);
router.post("/online/add", addUserOnline);
router.post("/online/remove", removeUserOnline);
router.get("/online/:groupName", getOnlineUsers);

export default router;
