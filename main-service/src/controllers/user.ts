import { asyncHandler } from "../utils/asyncHandler.ts";
import { ApiError } from "../utils/ApiError.ts";
import User from "../models/user.ts";
import { ApiResponse } from "../utils/ApiResponse.ts";
import jwt, { JwtPayload } from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId: string) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new ApiError(404, "User not found");

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

const registerUser = asyncHandler(async (req: any, res: any) => {
  const { fullName, email, username, password } = req.body;

  if ([fullName, email, username, password].some((field) => !field?.trim())) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }

  const user = await User.create({
    fullName,
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Failed to register the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

const loginUser = asyncHandler(async (req: any, res: any) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id as string
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use `secure` only in production
    sameSite: "strict",
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req: any, res: any) => {
  if (req.user) {
    await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { refreshToken: 1 } },
      { new: true }
    );
  }

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use `secure` only in production
    sameSite: "strict",
  };

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler(async (req: any, res: any) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    const decodedToken: any = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const user = await User.findById(decodedToken?._id).select("-password");

    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Refresh token is invalid or expired");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id as string);

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, cookieOptions)
      .cookie("refreshToken", newRefreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(
      401,
      (error as Error)?.message || "Invalid refresh token"
    );
  }
});

const getLoginStatus = asyncHandler(async (req: any, res: any) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req.body.refreshToken;
  const incomingAccessToken = req.cookies?.accessToken || req.body.accessToken;
  if (!incomingRefreshToken) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { isLoggedIn: false }, "User is not logged in")
      );
  }

  try {
    const decodedRefreshToken: any = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    );

    const user = await User.findById(decodedRefreshToken?._id);

    if (!user || incomingRefreshToken !== user.refreshToken) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, { isLoggedIn: false }, "User is not logged in")
        );
    }
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    if (!incomingAccessToken) {
      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshTokens(user._id as string);
      return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", newRefreshToken, cookieOptions)
        .json(
          new ApiResponse(
            200,
            { isLoggedIn: true, accessToken, refreshToken: newRefreshToken },
            "User is logged in"
          )
        );
    } else {
      const decodedAccessToken: JwtPayload = jwt.verify(
        incomingAccessToken,
        process.env.ACCESS_TOKEN_SECRET!
      ) as JwtPayload;

      const user2 = await User.findById(decodedAccessToken?._id).select(
        "-password -refreshToken"
      );

      if (!user2) {
        const { accessToken, refreshToken: newRefreshToken } =
          await generateAccessAndRefreshTokens(user._id as string);
        return res
          .status(200)
          .cookie("accessToken", accessToken, cookieOptions)
          .cookie("refreshToken", newRefreshToken, cookieOptions)
          .json(
            new ApiResponse(
              200,
              { isLoggedIn: true, accessToken, refreshToken: newRefreshToken },
              "User is logged in"
            )
          );
      }
    }
    return res
      .status(200)
      .json(new ApiResponse(200, { isLoggedIn: true }, "User is logged in"));
  } catch {
    return res
      .status(401)
      .json(
        new ApiResponse(
          401,
          { isLoggedIn: false },
          "An error occurred while checking login status"
        )
      );
  }
});

const changeCurrentPassword = asyncHandler(async (req: any, res: any) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);
  if (!user || !(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(400, "Invalid old password");
  }

  user.password = newPassword;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req: any, res: any) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "User fetched successfully"));
});

const updateAccountDetails = asyncHandler(async (req: any, res: any) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    { fullName, email },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(new ApiResponse(200, user, "Account details updated successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  getLoginStatus,
  updateAccountDetails,
};
