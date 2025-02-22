import express from "express";
import { forgotPassword, login, signup, verifyOtpAndResetPassword } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.route("/signup").post(signup);

authRouter.route("/signin").post(login);

authRouter.route("/forgot-password").post(forgotPassword);

authRouter.route("/verify-otp").post(verifyOtpAndResetPassword);

export default authRouter;


/**
 * @swagger
 * /api/v1/auth/signup:
 *   post:
 *     summary: Signup a user
 *     description: Signup a user
 *     parameters:
 *       - name: name
 *         in: JSON
 *         type: string
 *         required: true
 *       - name: email
 *         in: JSON
 *         type: string
 *         required: true
 *       - name: password
 *         in: JSON
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: A list of users
 *       409: 
 *         description: User already exists!
 *       400: 
 *         description: All fields are required.
 * 
 * /api/v1/auth/signin:
 *   post:
 *     summary: Logs in a user
 *     description: Log-In a user
 *     parameters:
 *       - name: email
 *         in: JSON
 *         type: string
 *         required: true
 *       - name: password
 *         in: JSON
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400: 
 *         description: No User Found!.
 * 
 * /api/v1/auth/forgot-password:
 *   post:
 *     summary: Sends OTP to user's email
 *     description: Sends OTP to user's email
 *     parameters:
 *       - name: email
 *         in: JSON
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: OTP sent to your email.
 *       400: 
 *         description: No user found with this email!!.
 * 
 * /api/v1/auth/verifyOtpAndResetPassword:
 *   post:
 *     summary: Verify OTP & Reset password
 *     description: Verifies the OTP and resets the password if the OTP is valid.
 *     parameters:
 *       - name: email
 *         in: JSON
 *         type: string
 *         required: true
 *       - name: otp
 *         in: JSON
 *         type: string
 *         required: true
 *       - name: password
 *         in: JSON
 *         type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Password reset successfully.
 *       400: 
 *         description: No user found with this email!!. Or Invalid OTP
 *      
 */