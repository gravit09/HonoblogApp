import { Context } from "hono";

export const getAllBlogs = async (c: Context) => {
  c.status(200);
  return c.json("you acceses an protected route");
};
