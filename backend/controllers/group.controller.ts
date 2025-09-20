import type { Request, Response } from "express";
import { GroupModel } from "../models/group.model";
import { UserModel } from "../models/user.model";

// ------------------ CREATE GROUP ------------------
export const createGroup = async (req: any, res: any) => {
  try {
    const { groupName, avatar } = req.body;
    const username = req.user?.username; // middleware must attach user

    if (!username) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const newGroup = await GroupModel.create({
      groupName,
      admin: { username },
      members: [{ username }],
      avatar,
    });

    await UserModel.updateOne(
      { username },
      { $addToSet: { groups: groupName } }
    );

    res.json({ success: true, group: newGroup, message: "Group created" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ JOIN GROUP ------------------
export const joinGroup = async (req: any, res: any) => {
  try {
    const { groupName } = req.body;
    const username = req.user?.username;

    const group = await GroupModel.findOne({ groupName });
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    await UserModel.updateOne(
      { username },
      { $addToSet: { groups: groupName } }
    );

    await GroupModel.updateOne(
      { groupName },
      { $addToSet: { members: { username } } }
    );

    res.json({ success: true, message: "Joined successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ GET GROUPS BY USER ------------------
export const getGroupsByUser = async (req: Request, res: Response) => {
  try {
    const username = req.user?.username;
    const user = await UserModel.findOne({ username });
    res.json({ success: true, groups: user?.groups || [] });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ DELETE GROUP ------------------
export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { groupName } = req.body;
    const username = req.user?.username;

    const group = await GroupModel.findOne({ groupName });
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (group.admin.username !== username) {
      return res.status(403).json({ message: "Only admin can delete group" });
    }

    await GroupModel.deleteOne({ groupName });
    await UserModel.updateMany(
      { groups: groupName },
      { $pull: { groups: groupName } }
    );

    res.json({ success: true, message: "Group deleted" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ SAVE GROUP CHAT ------------------
export const saveGroupChat = async (req: any, res: any) => {
  try {
    const { groupName, message } = req.body;
    const username = req.user?.username;

    const chat = {
      sender: username!,
      receiver: groupName,
      message,
      status: "sent",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    await GroupModel.updateOne(
      { groupName },
      { $push: { messages: chat } }
    );

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ GET GROUP CHAT ------------------
export const getGroupChat = async (req: Request, res: Response) => {
  try {
    const { groupName } = req.params;
    const group = await GroupModel.findOne({ groupName });
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, chats: group.messages });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ GET GROUP AVATAR ------------------
export const getGroupAvatar = async (req: Request, res: Response) => {
  try {
    const { groupName } = req.params;
    const group = await GroupModel.findOne({ groupName });
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, avatar: group.avatar });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ GET MEMBERS & ADMIN ------------------
export const getGroupMembersAndAdmin = async (req: Request, res: Response) => {
  try {
    const { groupName } = req.params;
    const group = await GroupModel.findOne({ groupName });
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, members: group.members, admin: group.admin });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ------------------ ONLINE USERS ------------------
export const addUserOnline = async (req: any, res: any) => {
  try {
    const { groupName } = req.body;
    const username = req.user?.username;
    await GroupModel.updateOne(
      { groupName },
      { $addToSet: { online: username } }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const removeUserOnline = async (req: any, res: any) => {
  try {
    const { groupName } = req.body;
    const username = req.user?.username;
    await GroupModel.updateOne(
      { groupName },
      { $pull: { online: username } }
    );
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getOnlineUsers = async (req: any, res: any) => {
  try {
    const { groupName } = req.params;
    const group = await GroupModel.findOne({ groupName });
    if (!group) return res.status(404).json({ success: false, message: "Group not found" });
    res.json({ success: true, members: group.online });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
