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
  