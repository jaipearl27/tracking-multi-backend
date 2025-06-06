import ApiErrorResponse from "../utils/errors/apiErrorResponse.js";

export const error = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server Error";

    // wrong mongodb id error
    if (err.name === "CastError") {
        const message = `Resources not found with this id.. Invalid ${err.path}`;
        err = new ApiErrorResponse(message, 400);
    }

    // Duplicate key error
    if (err.code === 11000) {

        const message = `Duplicate key ${Object.keys(err.keyValue)} Entered`;
        err = new ApiErrorResponse(message, 400);
    }

    // wrong jwt error
    if (err.name === "JsonWebTokenError") {
        const message = `Your token is invalid please try again letter`;
        err = new ApiErrorResponse(message, 400);
    }

    // jwt expired
    if (err.name === "TokenExpiredError") {
        const message = `Your token is expired, please login and try again later!`;
        err = new ApiErrorResponse(message, 400);
    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message || "something went wrong:Try again later!!",
    });
};