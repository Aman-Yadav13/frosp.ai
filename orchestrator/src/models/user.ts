import mongoose, { Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Repl from "./repl.ts";

interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  fullName: string;
  refreshToken?: string;
  repls: mongoose.Types.ObjectId[];
  collab_repls: mongoose.Types.ObjectId[];
  totalUsageSeconds: number;
  totalSpaceUsedBytes: number;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
  generateRefreshToken(): string;
}

interface IUserModel extends Model<IUser> {}

const userSchema = new mongoose.Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    refreshToken: {
      type: String,
    },
    repls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repl",
      },
    ],
    collab_repls: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Repl",
      },
    ],
    totalUsageSeconds: { type: Number, default: 0 },
    totalSpaceUsedBytes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Repl.deleteMany({ owner: doc._id });
  }
});

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET!,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model<IUser, IUserModel>("User", userSchema);
export default User;
