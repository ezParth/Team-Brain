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

import { isAuthenticated } from "../controllers/user.controller";
import { askGroupQuestion } from "../controllers/pipeline.controller";

const router = Router();

// routes
router.post("/create", isAuthenticated,createGroup);
router.post("/join", isAuthenticated,joinGroup);
router.get("/getGroups", isAuthenticated,getGroupsByUser);
router.delete("/delete", isAuthenticated,deleteGroup);
router.post("/chat/save", isAuthenticated,saveGroupChat);
router.get("/chats/:groupName", isAuthenticated,getGroupChat);
router.get("/avatar/:groupName", isAuthenticated,getGroupAvatar);
router.get("/members/:groupName", isAuthenticated,getGroupMembersAndAdmin);
router.post("/online/add", isAuthenticated,addUserOnline);
router.post("/online/remove", isAuthenticated,removeUserOnline);
router.get("/online/:groupName", isAuthenticated,getOnlineUsers);
router.post("/askQuestion", isAuthenticated, askGroupQuestion)


export default router;
