import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./utils/env";
import { sendError } from "./utils/errors";
import { z } from "zod";
import MessageTemplate from "./models/MessageTemplate";
import FavoriteMessage from "./models/FavoriteMessage";
import Score from "./models/Score";

const allowedGames = ["flappy", "tetris"] as const;
const categoryEnum = ["birthday", "good_morning", "good_luck", "compliment", "encourage"] as const;

const corsOrigins = env.CORS_ORIGINS.map(o => o.trim()).filter(Boolean);
const corsOptions: cors.CorsOptions = {
  origin: (origin, cb) => {
    if (!origin || corsOrigins.includes(origin)) return cb(null, origin);
    return cb(new Error("Not allowed by CORS"));
  },
  credentials: false,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "X-Visitor-Id"]
};

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("tiny"));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: env.RATE_LIMIT_PER_MIN,
  standardHeaders: true,
  legacyHeaders: false
});
app.use("/messages", limiter);
app.use("/scores", limiter);

const getVisitorId = (req: express.Request) =>
  (req.headers["x-visitor-id"] as string) ||
  (req.body?.visitorId as string) ||
  (req.query?.visitorId as string) ||
  "";

app.get("/health", (_req, res) => res.json({ ok: true }));

const scoreSchema = z.object({
  game: z.enum(["flappy", "tetris"]),
  score: z.number().int().nonnegative(),
  meta: z.record(z.any()).optional()
});

app.post("/scores", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const parsed = scoreSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "INVALID_BODY", parsed.error.message, 400);
  const doc = await Score.create({ visitorId, ...parsed.data });
  res.json({ success: true, score: doc });
});

app.get("/leaderboard", async (req, res) => {
  const game = req.query.game;
  if (!allowedGames.includes(String(game) as any))
    return sendError(res, "INVALID_GAME", "game required", 400);
  const limit = Number(req.query.limit) || 20;
  const scores = await Score.find({ game }).sort({ score: -1, createdAt: 1 }).limit(limit);
  res.json({ scores });
});

app.get("/my-best", async (req, res) => {
  const visitorId = getVisitorId(req);
  const game = req.query.game;
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  if (!allowedGames.includes(String(game) as any))
    return sendError(res, "INVALID_GAME", "game required", 400);
  const best = await Score.findOne({ visitorId, game }).sort({ score: -1 });
  res.json({ best });
});

const nameReplace = (text: string, name?: string) =>
  text.replace("{NAME}", name || "Alexandra");

const fallbackTemplates: Record<string, string[]> = {
  birthday: ["La mulți ani, {NAME}! Azi strălucești. 🎂"],
  good_morning: ["Bună dimineața, {NAME}! Să ai o zi blândă. ☀️"],
  good_luck: ["Baftă multă, {NAME}! Țin pumnii. 🤞"],
  compliment: ["{NAME}, zâmbetul tău face ziua mai bună. ❤️"],
  encourage: ["Poți reuși, {NAME}! Sunt cu tine. 💪"]
};

const pickWeighted = (list: { text: string; weight?: number }[]) => {
  const total = list.reduce((s, i) => s + (i.weight || 1), 0);
  let r = Math.random() * total;
  for (const item of list) {
    r -= item.weight || 1;
    if (r <= 0) return item;
  }
  return list[0];
};

const pickFallback = (category: string) => {
  const arr = fallbackTemplates[category] || ["Mesaj pentru {NAME}"];
  return arr[Math.floor(Math.random() * arr.length)];
};

app.get("/messages/random", async (req, res) => {
  const category = String(req.query.category || "");
  if (!categoryEnum.includes(category as any)) return sendError(res, "INVALID_CATEGORY", "bad category", 400);
  const name = String(req.query.name || "");
  const templates = await MessageTemplate.find({ category });
  if (!templates.length) {
    const fallback = pickFallback(category);
    return res.json({ message: nameReplace(fallback, name) });
  }
  const chosen = pickWeighted(templates);
  res.json({ message: nameReplace(chosen.text, name) });
});

app.get("/messages/generate", async (req, res) => {
  const category = String(req.query.category || "");
  if (!categoryEnum.includes(category as any)) return sendError(res, "INVALID_CATEGORY", "bad category", 400);
  const name = String(req.query.name || "");
  const templates = await MessageTemplate.find({ category });
  if (!templates.length) {
    const fallback = pickFallback(category);
    return res.json({ message: nameReplace(fallback, name) });
  }
  const chosen = pickWeighted(templates);
  res.json({ message: nameReplace(chosen.text, name) });
});

const favSchema = z.object({
  text: z.string().min(1),
  category: z.string().min(1)
});

app.post("/favorites", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const parsed = favSchema.safeParse(req.body);
  if (!parsed.success) return sendError(res, "INVALID_BODY", parsed.error.message, 400);
  const fav = await FavoriteMessage.create({ visitorId, ...parsed.data });
  res.json({ favorite: fav });
});

app.get("/favorites", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const favs = await FavoriteMessage.find({ visitorId }).sort({ createdAt: -1 });
  res.json({ favorites: favs });
});

app.delete("/favorites/:id", async (req, res) => {
  const visitorId = getVisitorId(req);
  if (!visitorId) return sendError(res, "MISSING_VISITOR", "visitorId is required", 400);
  const deleted = await FavoriteMessage.findOneAndDelete({ _id: req.params.id, visitorId });
  if (!deleted) return sendError(res, "NOT_FOUND", "Favorite not found", 404);
  res.json({ success: true });
});

const port = Number(process.env.PORT ?? 3001);

mongoose
  .connect(env.MONGODB_URI)
  .then(() => {
    app.listen(port, () => console.log(`API on ${port}`));
  })
  .catch(err => {
    console.error("Mongo connect error", err.message);
    process.exit(1);
  });

