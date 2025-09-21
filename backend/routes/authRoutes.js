import express from "express";
import { register, login } from "../controllers/authController.js";
// Add this route after the imports  

const router = express.Router();


router.get("/", (req, res) => {
    res.json({ message: "Auth API working" });
  });
  
// Register new user
router.post("/register", register);

// Login user
router.post("/login", login);

export default router;
