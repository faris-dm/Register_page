import jwt, { verify } from "jsonwebtoken";
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

    const decoded = jwt.verify(token, secret) as {
      id: number;
    };
    const result = await Pool.query(
      "SELECT id, username, email FROM users WHERE id=$1,token=$2",
      [decoded.id, decoded.id]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ message: "Not logged in" });

    return res.status(200).json({ user: result.rows[0] });
  } catch (error) {
    return res.status(401).json({ message: "Not logged in" });
  }
});

export default router;
