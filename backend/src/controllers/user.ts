import { Context } from "hono";
import { sign } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

export const signupHandler = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    if (!body.name || !body.email || !body.password) {
      c.status(400);
      return c.json({ message: "Name, email, and password are required" });
    }

    const isUser = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (isUser) {
      c.status(403);
      return c.json({ message: "User with this email already exists" });
    }

    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: hashedPassword,
      },
    });

    const payload = { id: user.id, name: body.name };
    const token = await sign(payload, c.env.SECRET);

    c.status(201);
    return c.json({
      message: "Signup Successful",
      jwt: token,
    });
  } catch (error) {
    c.status(500);
    return c.json({ message: "Internal Server Error" });
  }
};

export const signInHandler = async (c: Context) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
      password: body.password,
    },
  });

  if (!user) {
    c.status(403);
    return c.json("No user with this credentials found");
  }

  const payload = { name: user.name, id: user.id };
  const token = await sign(payload, c.env.SECRET);
  c.status(200);
  return c.json({ message: "Login Success", token });
};
