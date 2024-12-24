import { Request, Response } from "express";
import { copyS3Folder } from "../aws.ts";
import Repl from "../models/repl.ts";

export const init = async (req: Request, res: Response) => {
  try {
    const { pname, planguage, pstack } = req.body;
    const user = (req as any).user;

    const createdRepl = await Repl.create({
      name: pname,
      language: planguage,
      stack: pstack,
      owner: user._id,
      collaborators: [user._id],
    });

    const replId = createdRepl._id;
    if (!replId) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to create project" });
    }

    await copyS3Folder(`base/${planguage}`, `code/${replId}`);

    return res.status(200).json({ success: true, repl: createdRepl });
  } catch (err) {
    console.error("Error while creating project:", err);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Project creation failed.",
    });
  }
};
