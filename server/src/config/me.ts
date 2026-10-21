import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import Pool from "./db.js";
import express from "express";
import type { Request, Response } from "express";
import "dotenv/config";
const secret: any = process.env.refreshSecret;

import { Router } from "express";
const router = Router();
router.get("/me", async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "Not logged in" });
    }

    const decoded = jwt.verify(token, secret) as { id: number };

    const result = await Pool.query(
      `SELECT users.id, users.username, users.email,
              profiles.first_name, profiles.last_name,
              profiles.bio, profiles.avater_url
       FROM users
       JOIN refresh_tokens ON refresh_tokens.user_id = users.id
       LEFT JOIN profiles ON profiles.user_id = users.id
       WHERE users.id = $1
         AND refresh_tokens.token = $2
         AND refresh_tokens.done_date > now()`,
      [decoded.id, token]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Not logged in" });
    }

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    console.error("/me error:", error);
    return res.status(401).json({ message: "Not logged in" });
  }
});

export default router;
