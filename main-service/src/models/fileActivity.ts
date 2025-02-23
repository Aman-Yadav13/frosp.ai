import mongoose from "mongoose";

export interface IFileActivity {
  project: mongoose.Types.ObjectId;
  filePath: string;
  createdBy: mongoose.Types.ObjectId;
  sizeBytes?: number;
  deleted?: boolean;
  deletedBy?: mongoose.Types.ObjectId;
  deletedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const fileActivitySchema = new mongoose.Schema<IFileActivity>(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Repl",
      required: true,
    },
    filePath: { type: String, required: true, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sizeBytes: { type: Number, required: true },
    deleted: { type: Boolean, default: false },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

fileActivitySchema.index({ project: 1, filePath: 1 }, { unique: true });
fileActivitySchema.index({ project: 1, deleted: 1 });
fileActivitySchema.index({ createdBy: 1, deleted: 1 });

const FileActivity = mongoose.model<IFileActivity>(
  "FileActivity",
  fileActivitySchema
);

export default FileActivity;
