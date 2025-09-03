import { Router } from "express";
import {
  getUsers,
  getUsersByRole,
  getUserById,
  createUser,
} from "../controllers/userController.js";
const router = Router();

// User routes
router.get("/users", getUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);


export default router;
