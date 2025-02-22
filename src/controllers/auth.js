

import dotnev from "dotenv";
import User from "../models/users.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import ApiErrorResponse from "../utils/errors/apiErrorResponse.js";

dotnev.config();

//SignUp controller
export const signup = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req?.body;


  if (!name || !email || !password) {
    return res.status(400).json({ status: false, message: "All fields are required." });
  }

  const existingUser = await User.findOne({ email });

  if (existingUser)
    return res.status(409).json({ status: false, message: "User already exists!" });

  const user = await User.create({
    name,
    email,
    password,
  })



  // const signUptoken = generateSignUpToken({
  //   name,
  //   email,
  //   mobileNumber,
  //   password,
  // });


  return res.status(200).json({
    success: true,
    message: "Signed up successfully.",
    user
  });

});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req?.body;
  const existingUser = await User.findOne({ email });


  if (!existingUser) res.status(400).json({ status: false, message: "No user found!!" });


  const isValidPassword = await existingUser.isPasswordCorrect(password);


  if (!isValidPassword)
    return next(new ApiErrorResponse("Wrong password", 400));


  const token = existingUser.generateToken();



  existingUser.token = token;
  await existingUser.save({ validateBeforeSave: false });


  res
    // .cookie("access_token", access_token, {
    //   ...COOKIE_OPTIONS,
    //   expires: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    // })
    // .cookie("refresh_token", refresh_token, {
    //   ...COOKIE_OPTIONS,
    //   expires: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
    // })
    .status(200)
    .json({ success: true, message: "Logged in successfully.", token });
});


//Logout controller
export const logout = asyncHandler(async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $unset: { token: 1 } },
      { new: true }
    );


    // Check if user was found
    if (!user) {
      return next(new ApiErrorResponse("User not found", 404)); // Return 404 if no user found
    }


    res
      .cookie("access_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      .cookie("refresh_token", "", { ...COOKIE_OPTIONS, maxAge: 0 })
      .status(200)
      .json({ success: true, message: "Logout successfully!" });
  } catch (error) {
    console.log(`Error in logout: ${error.message}`);
    return next(new ApiErrorResponse("Error in logout", 500));
  }
});
