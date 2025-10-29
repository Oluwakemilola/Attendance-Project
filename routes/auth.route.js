import { Router } from "express";
import { signIn, signUp } from "../Controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signUp);

authRouter.get("/signin", signIn);

export default authRouter
