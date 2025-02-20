import express from "express";
import { login, signup } from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.route("/signup").post(signup);

authRouter.route("/signin").post(login);

export default authRouter;
