import { Router } from "express";
import { signin, signUp } from "../Controllers/auth.controllers.js";

const authRouter = Router();

authRouter.post("/signup", signUp);

authRouter.post("/signin", signin);

export default authRouter
