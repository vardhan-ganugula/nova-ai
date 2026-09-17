import type { Request, Response } from "express";
import app from "../server/dist/index.js";

export default function handler(req: Request, res: Response) {
  // Ensure Express router sees the full request URL if rewritten by Vercel
  if (req.originalUrl && req.url !== req.originalUrl) {
    req.url = req.originalUrl;
  }
  return app(req, res);
}
