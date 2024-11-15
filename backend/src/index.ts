import { Hono } from "hono";
import { decode, sign, verify } from "hono/jwt";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { empty } from "@prisma/client/runtime/library";
import { use } from "hono/jsx";

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

interface Bindings {
  DATABASE_URL: string;
  SECRET: string;
}

interface Variables {
  userId: any;
}

//middleware in hono also can use the function way to write middleware
app.use("/api/v1/blog/*", async (c, next) => {
  const header = c.req.header("Authorization") || "";
  const token = header.split(" ")[1];
  const response = await verify(token, c.env.SECRET);
  if (!response) {
    c.status(403);
    return c.json("Unauthorized");
  }
  c.set("userId", response.id);
  await next();
});

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

app.post("/api/v1/signin", async (c) => {
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
});

export default app;
