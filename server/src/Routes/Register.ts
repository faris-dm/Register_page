import express from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import Pool from "../config/db.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";

const router = Router();
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());

const secret = process.env.AccessSecret as string;
const refreshSecret = process.env.refreshSecret as string;

const generateAccess = (accessInputs: any): string => {
  return jwt.sign(accessInputs, secret, { expiresIn: "15m" });
};

const geneateRefresh = (refreshInput: any): string => {
  return jwt.sign(refreshInput, refreshSecret, { expiresIn: "7d" });
};

//  https://www.figma.com/design/0zf7EfwkdTxHP8fFh1O3uG/Course-Selling-Website--Community-?node-id=0-1&p=f&t=t5i17zRQd5jAs76J-0

// https://www.figma.com/design/FfvQPAsnJpaVQjSzUDCN6h/Destinize---Travel-Website-Landing-Page--Community-?node-id=0-1&p=f&t=LpkBqkVrV0QpCUuK-0

// https://www.figma.com/design/YCneKQPX30u7cgftgXVAsp/Effortless-Travel-UI-%25E2%2580%2593-Flight-Booking-Website--Community-?node-id=0-1&p=f&t=xqvCT2zcSCRge4MM-0
// get the user

//  this was  the post route  for the register
router.post("/signup", async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Fill all fields" });
    }

    const selectQuery = await Pool.query(
      `
  SELECT *  FROM  users  WHERE  email=$1`,
      [email]
    );

    const Result = selectQuery.rows.length;
    if (Result > 0) {
      return res.status(409).json({ message: "email aready exist" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const saveUser = await Pool.query(
      `
     INSERT INTO users (username,email, password_hash
)   VALUES ($1,$2,$3) RETURNING id,username,email
    `,
      [username, email, hashPassword]
    );

    const finalResult = saveUser.rows[0];

    const accessInputs = {
      id: finalResult.id,
      email: finalResult.email,
    };

    const refreshInput = {
      id: finalResult.id,
    };

    const accessToknes = generateAccess(accessInputs);
    console.log(accessToknes);
    const refreshTokens = geneateRefresh(refreshInput);
    await Pool.query(
      `
 INSERT INTO  refresh_tokens (user_id,token,done_date)  VALUES ($1,$2,$3) RETURNING id,user_id,token`,
      [
        finalResult.id,
        refreshTokens,
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ]
    );

    res.cookie("token", accessToknes, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshTokens, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      success: true,
      message: "registed succefully",
      user: finalResult,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json("incorrect inputs ");
    }

    const selectUserInfo = await Pool.query(
      `
        SELECT * FROM  users WHERE  email=$1  
         `,
      [email]
    );

    if (selectUserInfo.rows.length === 0) {
      return res.status(401).json("incorrect inputs ");
    }

    const full_Info = selectUserInfo.rows[0];
    const comparePassword = await bcrypt.compare(
      password,
      full_Info.password_hash
    );

    if (!comparePassword) {
      return res.status(401).json("incorrect inputs");
    }

    const accessInputs = {
      id: full_Info.id,
      email: full_Info.email,
    };
    const refreshInput = {
      id: full_Info.id,
    };

    const accessToknes = generateAccess(accessInputs);
    const refresh_tokens = geneateRefresh(refreshInput);
    console.log(accessToknes, "accesstokens");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Pool.query(
      ` INSERT INTO refresh_tokens (user_id,token,done_date) VALUES ($1,$2,$3) `,
      [full_Info.id, refresh_tokens, expiresAt]
    );

    res.cookie("token", accessToknes, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refresh_tokens, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Loin succefully",
      user: {
        id: full_Info.id,
        username: full_Info.username,
        email: full_Info.email,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server failed");
  }
});

router.post("/logout", async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    const CheckToknes = await Pool.query(
      `
        SELECT * FROM  refresh_tokens WHERE token=$1 `,
      [refreshToken]
    );

    if (CheckToknes.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Refresh token not found" });
    }

    await Pool.query(`DELETE FROM refresh_tokens WHERE token=$1`, [
      refreshToken,
    ]);

    res.clearCookie("token", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server failed");
  }
});

router.post("/refreshToken", async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ success: false, message: "No refresh token provided" });
    }

    jwt.verify(refreshToken, refreshSecret, async (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: "Invalid or expired refresh token",
        });
      }
      const checkTokeDb = await Pool.query(
        `
          SELECT * FROM refresh_tokens WHERE user_id=$1 AND token=$2 `,
        [decoded.id, refreshToken]
      );

      if (checkTokeDb.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "Refresh token not recognized",
        });
      }
      const tokenResult = await Pool.query(
        `
  SELECT id,email from users WHERE id=$1`,
        [decoded.id]
      );

      const finalResult = tokenResult.rows[0];

      const newAccesToken = generateAccess({
        id: finalResult.id,
        email: finalResult.email,
      });

      res.cookie("token", newAccesToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });

      return res
        .status(200)
        .json({ success: true, message: "Access token refreshed" });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server failed");
  }
});

export default router;
