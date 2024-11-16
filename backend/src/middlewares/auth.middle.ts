import { Context, Next } from "hono";
import { verify } from "hono/jwt";

export const AuthCheck = async (c: Context, next: Next) => {
  const header = c.req.header("Authorization") || "";
  if (!header.startsWith("Bearer ")) {
    c.status(403);
    return c.json({
      message: "Unauthorized: Invalid Authorization header format",
    });
  }
  const token = header.split(" ")[1];
  try {
    const response = await verify(token, c.env.SECRET);
    console.log(response);
    if (!response) {
      c.status(403);
      return c.json({ message: "Unauthorized: Invalid token" });
    }

    c.set("userId", response.id);
    await next();
  } catch (err) {
    console.error("Token verification error:", err);
    c.status(500);
    return c.json({ message: "Internal Server Error" });
  }
};
