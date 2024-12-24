import express from "express";
import { init } from "../controllers/init.ts";
import { verifyJWT } from "../middleware/auth.middleware.ts";
import {
  deleteReplByReplid,
  getReplByReplid,
  getReplsByUserId,
} from "../controllers/repl.ts";

const router = express.Router();

router.post("/create", verifyJWT, init);
router.get("/getReplsByUserId", verifyJWT, getReplsByUserId);
router.get("/getReplByReplid/:id", verifyJWT, getReplByReplid);
router.delete("/deleteReplByReplid/:id", verifyJWT, deleteReplByReplid);
export default router;
