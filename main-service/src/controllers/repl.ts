import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.ts";
import Repl from "../models/repl.ts";
import { ApiError } from "../utils/ApiError.ts";
import { deleteS3Folder } from "../aws.ts";
import { randomUUID } from "crypto";
import { Ws } from "../ws.ts";
import User from "../models/user.ts";

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

const getAllProjectsByUserId = asyncHandler(async (req: any, res: any) => {
  const user = (req as any).user;
  if (!user) {
    res.status(401).json({ success: false, error: "Unauthorized" });
  }
  try {
    const repls = await Repl.find({ owner: user._id }).populate(
      "collaborators",
      "-password -refreshToken -collab_repls -repls -updatedAt -createdAt -username"
    );
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
    const repl = await Repl.findOne({ _id: id, owner: req.user._id }).populate(
      "collaborators",
      "-password -refreshToken -collab_repls -repls -updatedAt -createdAt -username"
    );
    if (!repl) {
      res.status(404).json({ success: false, error: "Project not found" });
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
      res.status(404).json({ success: false, error: "Project not found" });
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

const updateCollaborationStatus = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = await Repl.findById(id);
    if (!repl) {
      res.status(404).json({ error: "Project not found" });
    } else {
      const status = repl.collaborative;
      repl.collaborative = !status;
      await repl.save();
      res.status(200).json({ success: true, repl });
    }
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const updateInviteCode = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = await Repl.findById(id);
    if (!repl) {
      res.status(404).json({ error: "Project not found" });
    } else {
      repl.inviteCode = randomUUID();
      await repl.save();
      res.status(200).json({ success: true, repl });
    }
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const matchInviteCode = asyncHandler(async (req: any, res: any) => {
  const { id, inviteCode } = req.params;
  try {
    const repl = await Repl.findById(id);
    if (!repl) {
      res.status(404).json({ error: "Project not found" });
    } else {
      if (repl.inviteCode === inviteCode) {
        if (
          repl.collaborators.some((collaborator) =>
            collaborator.equals(req.user._id)
          ) ||
          repl.owner.equals(req.user._id)
        ) {
          return res
            .status(200)
            .json({ matchFound: true, alreadyExists: true });
        }

        const addedUser = await User.findById(req.user._id);
        if (!addedUser) {
          return res.status(404).json({ error: "User not found" });
        }

        addedUser?.collab_repls.push(repl._id as any);
        repl.collaborators.push(req.user._id);
        await addedUser?.save();
        await repl.save();
        res.status(200).json({ matchFound: true, alreadyExists: false });
      } else {
        res.status(401).json({ matchFound: false });
      }
    }
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const getInviteInformation = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = await Repl.findById(id).populate(
      "owner",
      "-password -refreshToken -collab_repls -repls -updatedAt -createdAt -username"
    );
    if (!repl) {
      res.status(404).json({ error: "Project not found" });
    } else {
      const pname = repl.name;
      const powner = (repl.owner as any).fullName;
      res.status(200).json({ pname, powner });
    }
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const getFreeTimeLeft = asyncHandler(async (req: any, res: any) => {
  const { id } = req.params;
  try {
    const repl = await Repl.findById(id);
    if (!repl) {
      res.status(404).json({ error: "Project not found" });
    } else {
      const timeLeft = repl.freeTrialRemaining;
      res.status(200).json({ timeLeft });
    }
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const getProjectTags = asyncHandler(async (req: any, res: any) => {
  const projectTags = [
    "Web Development",
    "Machine Learning",
    "Data Science",
    "Mobile App",
    "Open Source",
    "Full Stack",
    "Frontend",
    "Backend",
    "Cloud Computing",
    "Blockchain",
    "Game Development",
    "Cybersecurity",
    "DevOps",
    "IoT",
    "AI",
    "Database Management",
    "E-commerce",
    "Automation",
    "AR/VR",
    "Health Tech",
    "Finance Tech",
    "Social Media",
    "SaaS",
    "CLI Tool",
    "CMS",
    "API Development",
    "Web3",
    "Natural Language Processing",
    "Robotics",
    "Education",
    "Entertainment",
    "Hardware Integration",
    "Real-time Systems",
    "Serverless",
    "Microservices",
  ];
  try {
    res.status(200).json({ tags: projectTags });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const getProjectLanguages = asyncHandler(async (req: any, res: any) => {
  try {
    const projectLanguages = {
      nodejs: "Node.js",
      python: "Python",
    };
    res.status(200).json({ languages: projectLanguages });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

const updateGeneralDetails = asyncHandler(async (req: any, res: any) => {
  try {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, error: "Project id not provided" });
    const { name, description, tags, language } = req.body;
    const repl = await Repl.findById(id);
    if (!repl) {
      return res
        .status(404)
        .json({ success: false, error: "Project not found" });
    }
    repl.name = name;
    repl.description = description;
    repl.tags = tags;
    repl.language = language;
    await repl.save();
    res.status(200).json({ success: true, repl });
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Something went wrong!"
    );
  }
});

export {
  getReplsByUserId,
  getReplByReplid,
  getAllProjectsByUserId,
  deleteReplByReplid,
  updateCollaborationStatus,
  updateInviteCode,
  matchInviteCode,
  getFreeTimeLeft,
  getProjectTags,
  getProjectLanguages,
  updateGeneralDetails,
  getInviteInformation,
};
