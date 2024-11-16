import { Hono } from "hono/tiny";
export const blogRouter = new Hono();
import { AuthCheck } from "../middlewares/auth.middle";
import {
  getAllBlogs,
  createBlog,
  getBlogWithId,
  updateBlog,
} from "../controllers/blog";

blogRouter.use("/*", AuthCheck);
blogRouter.get("/bulk", getAllBlogs);
blogRouter.post("/", createBlog);
blogRouter.get("/", getBlogWithId);
blogRouter.put("/", updateBlog);
