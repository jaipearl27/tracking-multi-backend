import User from "../models/user/user.js";
import ApiErrorResponse from "../utils/errors/ApiErrorResponse.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import jwt from "jsonwebtoken";


export const authenticateToken = asyncHandler(async (req, res, next) => {
  const token =
    req?.cookies?.access_token ||
    req.header("Authorization")?.replace("Bearer ", "");
console.log("the acces toke", token);
  if (!token) {
    return next(new ApiErrorResponse("Unauthorized user", 401));
  }
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decoded) {
    return next(new ApiErrorResponse("Invalid access token!", 401));
  }
  const user = await User.findById(decoded._id).select(
    "-password -refreshToken"
  );
  if (!user) {
    return next(new ApiErrorResponse("Invalid access token!", 401));
  }
  req.user = user;
  next();
});


export const verifyPermission = (roles = []) =>
  asyncHandler(async (req, res, next) => {
    if (!req.user?._id) {
      return next(new ApiErrorResponse("Unauthorized request", 401));
    }
    if (roles.includes(req.user?.role)) {
      next();
    } else {
      return next(new ApiErrorResponse("Access denied", 403));
    }
  });
