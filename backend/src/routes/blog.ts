import { Hono } from "hono/tiny";
export const blogRouter = new Hono();
import { AuthCheck } from "../middlewares/auth.middle";
import { getAllBlogs } from "../controllers/blog";

blogRouter.use("/*", AuthCheck);
blogRouter.get("/bulk", getAllBlogs);
