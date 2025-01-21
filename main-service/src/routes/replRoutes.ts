import express from "express";
import { init } from "../controllers/init.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import {
  deleteReplByReplid,
  getReplByReplid,
  getReplsByUserId,
  matchInviteCode,
  updateInviteCode,
  updateCollaborationStatus,
  getFreeTimeLeft,
  getAllProjectsByUserId,
  getProjectTags,
  getProjectLanguages,
  updateGeneralDetails,
  getInviteInformation,
} from "../controllers/repl.ts";

const router = express.Router();

router.post("/create", verifyJWT, init);
router.get("/getReplsByUserId", verifyJWT, getReplsByUserId);
router.get("/getAllProjectsByUserId", verifyJWT, getAllProjectsByUserId);
router.get("/getReplByReplid/:id", verifyJWT, getReplByReplid);
router.delete("/deleteReplByReplid/:id", verifyJWT, deleteReplByReplid);
router.patch(
  "/updateCollaborationStatus/:id",
  verifyJWT,
  updateCollaborationStatus
);
router.patch("/inviteCode/:id", verifyJWT, updateInviteCode);
router.get("/matchInviteCode/:id/:inviteCode", verifyJWT, matchInviteCode);
router.get("/getInviteInfo/:id", verifyJWT, getInviteInformation);
router.get("/getFTL/:id", verifyJWT, getFreeTimeLeft);
router.get("/getProjectTags", getProjectTags);
router.get("/getProjectLanguages", getProjectLanguages);
router.patch("/updateGeneralDetails/:id", verifyJWT, updateGeneralDetails);

export default router;
