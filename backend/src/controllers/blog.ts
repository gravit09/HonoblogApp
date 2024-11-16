import { Context } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const getAllBlogs = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const allBlogs = await prisma.post.findMany();
    if (!allBlogs) {
      c.status(200);
      return c.json("No blogs found");
    }
    c.status(200);
    return c.json({ message: "blogs fetch successfull", blogs: allBlogs });
  } catch (err) {
    c.status(403);
    return c.json("Something went while fetching blogs");
  }
};

export const createBlog = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const authorId = c.get("userId");
    const blog = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: authorId,
      },
    });
    c.status(200);
    return c.json("blog created Successfully");
  } catch (err) {
    console.log(err);
    c.status(401);
    return c.json("Something went wrong while creating blog");
  }
};

export const getBlogWithId = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const id = c.req.query("id");
    const blogs = await prisma.post.findFirst({
      where: {
        id: id,
      },
    });
    c.status(200);
    return c.json({
      message: "blogs fetched",
      blogs: blogs,
    });
  } catch (err) {
    c.status(403);
    console.log(err);
    return c.json("something went wrong while fetching blogs");
  }
};

export const updateBlog = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    const body = await c.req.json();
    const blogId = c.req.query("id");
    const updatedBlog = await prisma.post.update({
      where: {
        id: blogId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });
    c.status(200);
    return c.json({ message: "blog upadated succesfully", blog: updatedBlog });
  } catch (err) {
    console.log(err);
    c.status(411);
    return c.json("Something went wrong while creating blog");
  }
};
