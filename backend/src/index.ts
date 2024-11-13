import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient().$extends(withAccelerate());
  const body = await c.req.json();
  await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: body.password,
    },
  });
  return c.text("this is signup route");
});

export default app;
