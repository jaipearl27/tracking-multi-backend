

import dotnev from "dotenv";
import User from "../models/users.js";
import { asyncHandler } from "../utils/errors/asyncHandler.js";
import ApiErrorResponse from "../utils/errors/apiErrorResponse.js";
import otpModel from "../models/otp.js";
import { sendOtpMail } from "../utils/mail.js";

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


export const forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

  if (!existingUser) return res.status(400).json({ status: false, message: "No user found with this email!!" });

  const otpExists = await otpModel.findOne({ email })



  if (otpExists) {


    console.log(new Date(Date.now() - 30000))

    const validSecondsPassed = new Date(otpExists.createdAt) < new Date(Date.now() - 30000);

    if (!validSecondsPassed) {
      return res.status(400).json({ status: false, message: 'Please wait 30 seconds before requesting for OTP again.' })
    }



    await otpModel.deleteOne({ email })
    console.log("old OTP deleted")
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const otpDocument = await otpModel.create({
    email,
    otp
  })

  const otpMail = await sendOtpMail(email, otp);

  if (otpMail) {
    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      otpDocument
    })
  } else {
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP to your email"
    })
  }


})


export const verifyOtpAndResetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const otpDocument = await otpModel.findOne({ email, otp });

  if (!otpDocument) return res.status(400).json({ status: false, message: "Invalid OTP" });

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ status: false, message: "No user found with this email!!" });

  user.password = password;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({
    success: true,
    message: "Password reset successfully"
  })
})


