import { Router } from "express";
import { isAuthenticated, login, logout, signup } from "../controllers/user.controller";

const router = Router()

router.post("/login", login)
router.post("/signup", signup)
router.post("/logout", isAuthenticated,logout)

export default router