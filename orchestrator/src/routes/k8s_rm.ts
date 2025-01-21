import express from "express";
import { handleResourceRequest } from "../controllers/k8s_rm.ts";

const router = express.Router();

router.post("/start", handleResourceRequest);

export default router;
