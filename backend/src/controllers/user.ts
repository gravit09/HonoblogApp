import { Context } from "hono";
import { sign } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { signinInput } from "@gravit_7/blogchecks";

export const signupHandler = async (c: Context) => {
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();
    const { success } = signinInput.safeParse(body);
    if (!success) {
      c.status(400);
      return c.json({ message: "Invalid type of credentials provided" });
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
  try {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = await c.req.json();

    if (!body.email || !body.password) {
      c.status(400);
      return c.json({ message: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      c.status(403);
      return c.json({ message: "No user with this email found" });
    }

    const bcrypt = await import("bcryptjs");

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      c.status(403);
      return c.json({ message: "Invalid credentials" });
    }

    const payload = { name: user.name, id: user.id };
    const token = await sign(payload, c.env.SECRET);

    c.status(200);
    return c.json({ message: "Login Successful", token });
  } catch (error) {
    console.error(error);
    c.status(500);
    return c.json({ message: "Internal Server Error" });
  }
};
