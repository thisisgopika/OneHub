import { Router } from "express"; //express provides this feature called router
import { register, login } from "../controllers/authController.js"; //imports the register function from controller
import { verifyToken } from "../middleware/auth.js";  // Import the middleware

const router = Router();

//imports the register function from controller
router.post("/register", register);   //defines an api endpoint 
router.post("/login", login);

// Test protected route
router.get("/profile", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user  // This comes from the middleware
  });
});

export default router;  //expport that so that we can use it in app.js
  



