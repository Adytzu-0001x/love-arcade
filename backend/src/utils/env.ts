import dotenv from "dotenv";
dotenv.config();

export const env = {
  PORT: Number(process.env.PORT) || 3001,
  MONGODB_URI: process.env.MONGODB_URI || "",
  CORS_ORIGINS: (process.env.CORS_ORIGINS || "http://localhost:3000").split(",").map(o => o.trim()),
  RATE_LIMIT_PER_MIN: Number(process.env.RATE_LIMIT_PER_MIN || 60),
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || ""
};


