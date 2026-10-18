import express, { Router } from "express";
import type { Request, Response } from "express";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import jwt from "jsonwebtoken";
import passport from "passport";
import cookieParser from "cookie-parser";
import "dotenv/config";

import Pool from "../config/db.js";
const router = Router();
router.use(cookieParser());
router.use(passport.initialize());
const API_URL = "http://localhost:2040";
import type { VerifyCallback } from "passport-oauth2";
// pasport.use( new go({}, aync (a,b,c,d)=> {} return))
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: `${API_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          id: profile.id,
          email: profile.emails?.[0]?.value,

          //   in google the dat is like email:[{values:"email"},[values:"email"]] so we need to acess the first elemets
          name: profile.displayName,
        };
        const verified = profile.emails?.[0]?.verified;
        if (!user.email || !verified) return done(null, false);
        const googleLookup = await Pool.query(
          `SELECT users.id, users.email
       FROM users
       JOIN login_methods ON users.id = login_methods.user_id
       WHERE login_methods.provider = 'google' AND login_methods.provider_user_id = $1`,
          [profile.id]
        );

        let row = googleLookup.rows[0];

        if (!row) {
          const emailLookup = await Pool.query(
            `SELECT id, email FROM users WHERE email = $1`,
            [user.email]
          );
          row = emailLookup.rows[0];

          if (!row) {
            const created = await Pool.query(
              `INSERT INTO users (username,email) VALUES ($1,$2) RETURNING id, email`,
              [user.id, user.email]
            );
            row = created.rows[0];

            await Pool.query(
              `INSERT INTO profiles (user_id, first_name,last_name,avater_url) VALUES ($1, $2,$3,$4)`,
              [
                row.id,
                profile.name?.givenName ?? null,
                profile.name?.familyName ?? null,
                profile.photos?.[0]?.value ?? null,
              ]
            );
          }

          await Pool.query(
            `INSERT INTO login_methods (user_id, provider, provider_user_id)
         VALUES ($1, 'google', $2)`,
            [row.id, profile.id]
          );
        }

        return done(null, row);
      } catch (error) {
        return done(error as Error);
      }
    }
  )
);

router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// localhost:2040/api/auth/github/callback
http: router.get(
  "/auth/google/callback",
  passport.authenticate("google", { session: false }),
  async (req, res) => {
    const user = req.user as { id: string; email: string; name: string };

    // Generate a JWT token
    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.AccessSecret as string,
      { expiresIn: "15m" }
    );
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.refreshSecret as string,
      { expiresIn: "7d" }
    );
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await Pool.query(
      `INSERT INTO refresh_tokens  (user_id,token,done_date)  VALUES ($1,$2,$3)`,
      [user.id, refreshToken, expires]
    );

    // Set the token in an HTTP-only cookie
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.redirect("http://localhost:5174/api/profile"); // Redirect to the frontend
  }
);

// passport.use(
//   new GitgubStrategy({
//     clientId: process.env.GITHUB_CLIENT_ID as string,
//     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//     callbackURL: `${API_URL}/api/github/callback`,
//   })
// );

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: `${API_URL}/api/auth/github/callback`,
      scope: ["user:email"],
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: any,
      done: VerifyCallback
    ) => {
      try {
        const githubId = String(profile.id);
        const email = profile.emails?.[0]?.value ?? null;
        const username = profile.username ?? `github_${githubId}`;
        const nameParts = (profile.displayName ?? "").split(" ");
        const firstName = nameParts[0] || null;
        const lastName = nameParts[1] || null;
        const avatarUrl = profile.photos?.[0]?.value ?? null;

        // 1. Returning GitHub user? Match on GitHub's id, not your local user id
        const existing = await Pool.query(
          `SELECT users.id, users.email
           FROM users
           JOIN login_methods ON users.id = login_methods.user_id
           WHERE login_methods.provider = 'github'
             AND login_methods.provider_user_id = $1`,
          [githubId]
        );
        let row = existing.rows[0];

        // 2. Not linked yet: find by email, or create a new user
        if (!row) {
          if (email) {
            const byEmail = await Pool.query(
              `SELECT id, email FROM users WHERE email = $1`,
              [email]
            );
            row = byEmail.rows[0];
          }

          if (!row) {
            const created = await Pool.query(
              `INSERT INTO users (username, email) VALUES ($1, $2) RETURNING id, email`,
              [username, email]
            );
            row = created.rows[0];

            await Pool.query(
              `INSERT INTO profiles (user_id, first_name, last_name, avater_url)
               VALUES ($1, $2, $3, $4)`,
              [row.id, firstName, lastName, avatarUrl]
            );
          }

          await Pool.query(
            `INSERT INTO login_methods (user_id, provider, provider_user_id)
             VALUES ($1, $2, $3)`,
            [row.id, "github", githubId]
          );
        }

        if (!row) return done(new Error("GitHub login: no user row"));
        return done(null, row);
      } catch (error) {
        console.error("GitHub verify error:", error);
        return done(error as Error);
      }
    }
  )
);

// redirect to the  githun Oauth
router.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/auth/github/callback",
  (req, res, next) => {
    passport.authenticate(
      "github",
      { session: false },
      (err: any, user: any, info: any) => {
        console.log("CALLBACK err:", err);
        console.log("CALLBACK user:", user);
        console.log("CALLBACK info:", info);
        if (err) return next(err);
        if (!user)
          return res.status(401).json({ message: "No user returned", info });
        req.user = user;
        next();
      }
    )(req, res, next);
  },
  async (req, res) => {
    try {
      const User = req.user as { id: string; email: string };

      // Generate tokens
      const accessToken = jwt.sign(
        { id: User.id, email: User.email },
        process.env.AccessSecret as string,
        { expiresIn: "15m" }
      );
      const refreshToken = jwt.sign(
        { id: User.id },
        process.env.refreshSecret as string,
        { expiresIn: "7d" }
      );

      const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await Pool.query(
        `INSERT INTO refresh_tokens (user_id,token,done_date ) VALUES ($1,$2,$3)`,
        [User.id, refreshToken, expires]
      );

      res.cookie("token", accessToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      res.redirect("http://localhost:5174/api/profile");
    } catch (error) {
      console.log("error in the  github cllback ", error as Error);
      return res.status(500).send("internal server error");
    }
  }
);

export default router;
