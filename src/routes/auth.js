

import express from "express";
import { forgotPassword, login, logout, signup, verifyOtpAndResetPassword } from "../controllers/auth.js";
import { authenticateToken } from "../middlewares/authenticateToken.js";

const authRouter = express.Router();

authRouter.route("/signup").post(signup);
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
 */


authRouter.route("/signin").post(login);

/**
* @swagger
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
*/


authRouter.route("/logout").post(authenticateToken, logout);

/**
* @swagger
* /api/v1/auth/logout:
*   post:
*     summary: Logs out a user
*     description: Log-out a user
*     responses:
*       200:
*         description: Logged out successfully
*       400: 
*         description: No User Found!.
*/



authRouter.route("/forgot-password").post(forgotPassword);

/**
 * @swagger 
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
 */



authRouter.route("/verify-otp").post(verifyOtpAndResetPassword);

/**
 * @swagger
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


export default authRouter;

