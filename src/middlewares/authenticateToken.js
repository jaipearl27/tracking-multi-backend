
import User from "../models/users.js";
import ApiErrorResponse from "../utils/errors/apiErrorResponse.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import jwt from "jsonwebtoken";


export const authenticateToken = asyncHandler(async (req, res, next) => {

  // console.log('req.headers', req.headers)

  const token =
    req?.cookies?.access_token ||
    req.headers["authorization"]?.replace("Bearer ", "");
console.log("token", token);
  if (!token) {
    return next(new ApiErrorResponse("Unauthorized user 1", 401));
  }
  const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
  if (!decoded) {
    return next(new ApiErrorResponse("Invalid  token!", 401));
  }
  const user = await User.findById(decoded._id).select(
    "-password -token"
  );
  if (!user) {
    return next(new ApiErrorResponse("Invalid token!", 401));
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
