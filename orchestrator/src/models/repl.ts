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
    language: {
      type: String,
      required: true,
      trim: true,
    },
    stack: {
      type: String,
      trim: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    collaborative: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure name is unique per owner (avoiding duplicate repl names for the same user)
replSchema.index({ name: 1, owner: 1 }, { unique: true });

const Repl = mongoose.model<IRepl, IReplModel>("Repl", replSchema);
export default Repl;
