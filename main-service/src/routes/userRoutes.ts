import express from "express";
import {
  changeCurrentPassword,
  getCurrentUser,
  getLoginStatus,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
} from "../controllers/user.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyJWT, logoutUser);
router.post("/forceLogout", logoutUser);
router.post("/refresh-token", refreshAccessToken);
router.post("/change-password", verifyJWT, changeCurrentPassword);
router.get("/current-user", verifyJWT, getCurrentUser);
router.patch("/update-account", verifyJWT, updateAccountDetails);
router.get("/get-login-status", verifyJWT, getLoginStatus);

export default router;
