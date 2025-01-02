import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Repl from "../models/repl.ts";
import { ApiError } from "../utils/ApiError.ts";
import { deleteS3Folder } from "../aws.ts";

const getReplsByUserId = asyncHandler(async (req: any, res: any) => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const repls = await Repl.find({ owner: user._id });
    res.status(200).json({ success: true, repls });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const getReplByReplid = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = await Repl.findById(id).populate("collaborators");
    if (!repl) {
      res.status(404).json({ success: false, error: "Repl not found" });
    }
    res.status(200).json({ success: true, repl });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const deleteReplByReplid = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = Repl.findById(id);
    if (!repl) {
      res.status(404).json({ success: false, error: "Repl not found" });
    }
    await Repl.deleteOne({ _id: id });
    try {
      await deleteS3Folder(`repls/${id}`);
      console.log(`Repl project with id ${id} deleted from aws s3`);
    } catch (error) {
      console.error("Error deleting folder from aws s3:", error);
    }
    res.status(200).json({ success: true, message: "Repl deleted" });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

export { getReplsByUserId, getReplByReplid, deleteReplByReplid };
