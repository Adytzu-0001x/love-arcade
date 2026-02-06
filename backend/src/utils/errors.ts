import { Response } from "express";

export const sendError = (res: Response, code: string, message: string, status = 400) =>
  res.status(status).json({ error: { code, message } });



