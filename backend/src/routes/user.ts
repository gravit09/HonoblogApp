import { Hono } from "hono";
export const userRouter = new Hono();
import { signupHandler, signInHandler } from "../controllers/user";

userRouter.post("/signup", signupHandler);
userRouter.post("/signin", signInHandler);
