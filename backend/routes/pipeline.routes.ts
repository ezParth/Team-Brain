import { Router } from "express";
import { isAuthenticated } from "../controllers/user.controller";
import { askGroupQuestion } from "../controllers/pipeline.controller"
const router = Router()


export default router