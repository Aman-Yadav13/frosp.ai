import { ApiError } from "../utils/ApiError.ts";
import { asyncHandler } from "../utils/asyncHandler.ts";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.ts";
import { Request, Response, NextFunction } from "express";
import { UserType } from "../types/index.ts";

export const verifyJWT = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    try {
      const token =
        req.cookies?.accessToken ||
        req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        throw new ApiError(401, "Unauthorized request");
      }

      const decodedToken: JwtPayload = jwt.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      const user = await User.findById(decodedToken?._id).select(
        "-password -refreshToken"
      );

      if (!user) {
        throw new ApiError(401, "Invalid Access Token");
      }

      req.user = user as unknown as UserType;
      next();
    } catch (error) {
      throw new ApiError(
        401,
        (error as Error)?.message || "Invalid access token"
      );
    }
  }
);
