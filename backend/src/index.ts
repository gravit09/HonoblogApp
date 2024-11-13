import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { empty } from "@prisma/client/runtime/library";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

interface Bindings {
  DATABASE_URL: string;
  SECRET: string;
}

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const body = await c.req.json();

  const isUser = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
  });

  if (isUser) {
    c.status(403);
    return c.json("User with this credentials already exsist");
  }

  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  });
  const payload = { id: user.id, name: body.name };
  const token = await sign(payload, c.env.SECRET);
  return c.json({
    message: "Signup Succesfull",
    jwt: token,
  });
});

export default app;
