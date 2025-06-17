import { Context, Next } from "hono";

const VALID_API_KEYS = [
  Bun.env.API_KEY || "5c8adc99de44579f21069dc0e46a5fab99aa67d9a22cc0a302b4027e07329ec6"
];

export const verifyApiKey = async (c: Context, next: Next) => {
  const apiKey = c.req.header("x-api-key");

  if (!apiKey || !VALID_API_KEYS.includes(apiKey)) {
    return c.json({ message: "Unauthorized. Invalid API Key." }, 401);
  }

  await next();
};