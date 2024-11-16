import { Hono } from "hono";
import { userRouter } from "./routes/user";
import { blogRouter } from "./routes/blog";

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

app.route("/api/v1/user", userRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
