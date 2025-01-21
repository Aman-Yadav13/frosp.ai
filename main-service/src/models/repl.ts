import mongoose, { Document, Model } from "mongoose";

interface IRepl extends Document {
  name: string;
  language: string;
  stack?: string;
  owner: mongoose.Types.ObjectId;
  collaborators: mongoose.Types.ObjectId[];
  collaborative: boolean;
  createdAt: Date;
  updatedAt: Date;
  inviteCode: string;
  freeTrialRemaining: number;
  description?: string;
  visibility: "public" | "private";
  tags?: string[];
  lastOpenedAt?: Date;
  billingStatus: "trial" | "active" | "expired";
  totalUsageSeconds: number;
  archived: boolean;
}

interface IReplModel extends Model<IRepl> {}

const replSchema = new mongoose.Schema<IRepl>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
      lowercase: true,
    },
    language: { type: String, required: true, trim: true },
    stack: { type: String, trim: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    collaborative: { type: Boolean, default: false },
    inviteCode: { type: String, default: null },
    freeTrialRemaining: { type: Number, default: 3600 },

    description: { type: String, trim: true, default: "" },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "private",
    },
    tags: [{ type: String, trim: true }],
    lastOpenedAt: { type: Date, default: Date.now },
    billingStatus: {
      type: String,
      enum: ["trial", "active", "expired"],
      default: "trial",
    },
    totalUsageSeconds: { type: Number, default: 0 },
    archived: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

replSchema.index({ name: 1, owner: 1 }, { unique: true });
const Repl = mongoose.model<IRepl, IReplModel>("Repl", replSchema);
export default Repl;
