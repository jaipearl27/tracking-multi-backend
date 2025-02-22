import express from "express";
import { login, signup } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.route("/signup").post(signup);

authRouter.route("/signin").post(login);

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
 */