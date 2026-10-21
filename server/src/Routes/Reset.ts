import nodemailer from "nodemailer";
import Pool from "../config/db.js";
import jwt from "jsonwebtoken";
import "dotenv/config";
import crypto from "crypto";
import express from "express";
import bcrypt from "bcrypt";

const route = express.Router();

route.post("/forget_password", async (req, res) => {
  const { email } = req.body;

  try {
    const GetResetEmail = await Pool.query(
      ` SELECT * FROM  users WHERE email=$1`,
      [email]
    );
    if (GetResetEmail.rows.length === 0) {
      return res.status(409).json({ message: "User not found" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    const expires = new Date(Date.now() + 15 * 60 * 1000);

    await Pool.query(
      `UPDATE users SET reset_token_hash=$1  ,reset_token_expires=$2 WHERE email=$3`,
      [tokenHash, expires, email]
    );

    //    the link is used to reset the password

    const link = `${process.env.CLIENT_URL}/newPassword?token=${resetToken}`;
    console.log("link:", link);
    const Transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.Owner_EMAIL,
        pass: process.env.Owner_app_password,
      },

      tls: {
        // Skip the certificate check only while developing
        rejectUnauthorized: process.env.NODE_ENV === "production",
      },
    });
    // so we  did

    const info = await Transporter.sendMail({
      from: process.env.Owner_EMAIL,
      to: email,
      subject: "Reset Your Password",
      text: `Reset your password: ${link}\nThis link expires in 15 minutes.`,
      html: `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Reset Your Password - MERIDIAN</title>
    </head>

    <body style="
      margin: 0;
      padding: 0;
      background-color: #F7F7F2;
      font-family: Arial, Helvetica, sans-serif;
      color: #20251F;
    ">
      <table
        role="presentation"
        width="100%"
        cellpadding="0"
        cellspacing="0"
        style="background-color: #F7F7F2; padding: 40px 12px;"
      >
        <tr>
          <td align="center">

            <table
              role="presentation"
              width="100%"
              cellpadding="0"
              cellspacing="0"
              style="
                max-width: 480px;
                background-color: #FFFFFF;
                border: 1px solid #E7E8DF;
                border-radius: 16px;
                overflow: hidden;
              "
            >
              <!-- Brand -->
              <tr>
                <td style="padding: 30px 28px 20px; text-align: center;">
                  <h1 style="
                    margin: 0;
                    font-size: 24px;
                    font-weight: 700;
                    letter-spacing: 2px;
                    color: #20251F;
                  ">
                    MERIDIAN<span style="color: #82916F;">.</span>
                  </h1>

                  <p style="
                    margin: 8px 0 0;
                    color: #82916F;
                    font-size: 11px;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                  ">
                    Account Security
                  </p>
                </td>
              </tr>

              <!-- Divider -->
              <tr>
                <td style="padding: 0 28px;">
                  <div style="height: 1px; background-color: #ECEDE7;"></div>
                </td>
              </tr>

              <!-- Main Content -->
              <tr>
                <td style="padding: 32px 28px;">
                  <h2 style="
                    margin: 0 0 16px;
                    font-size: 25px;
                    line-height: 1.4;
                    font-weight: 600;
                    color: #20251F;
                  ">
                    Reset your password
                  </h2>

                  <p style="
                    margin: 0 0 16px;
                    font-size: 15px;
                    line-height: 1.8;
                    color: #62675E;
                  ">
                    You requested to reset your MERIDIAN account password.
                    Click the button below to create a new password.
                  </p>

                  <!-- Reset Button -->
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    style="margin: 28px 0;"
                  >
                    <tr>
                      <td
                        align="center"
                        bgcolor="#596B4D"
                        style="border-radius: 10px;"
                      >
                        <a
                          href="${link}"
                          target="_blank"
                          style="
                            display: inline-block;
                            padding: 15px 28px;
                            color: #FFFFFF;
                            font-size: 15px;
                            font-weight: 600;
                            text-decoration: none;
                            border-radius: 10px;
                          "
                        >
                          Reset My Password
                        </a>
                      </td>
                    </tr>
                  </table>

                  <p style="
                    margin: 0 0 12px;
                    font-size: 13px;
                    line-height: 1.7;
                    color: #777B72;
                  ">
                    This link will expire in <strong style="color: #30352D;">
                    15 minutes</strong> for your security.
                  </p>

                  <p style="
                    margin: 0;
                    font-size: 13px;
                    line-height: 1.7;
                    color: #777B72;
                  ">
                    If you did not request a password reset, you can safely
                    ignore this email. Your password will remain unchanged.
                  </p>
                </td>
              </tr>

              <!-- Fallback Link -->
              <tr>
                <td style="
                  padding: 22px 28px;
                  background-color: #FCFCFA;
                  border-top: 1px solid #ECEDE7;
                ">
                  <p style="
                    margin: 0 0 10px;
                    font-size: 12px;
                    color: #777B72;
                    line-height: 1.6;
                  ">
                    If the button does not work, copy and paste this link
                    into your browser:
                  </p>

                  <a
                    href="${link}"
                    style="
                      color: #596B4D;
                      font-size: 12px;
                      line-height: 1.7;
                      word-break: break-all;
                      text-decoration: underline;
                    "
                  >
                    ${link}
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="
                  padding: 22px 28px;
                  text-align: center;
                  background-color: #FFFFFF;
                ">
                  <p style="
                    margin: 0 0 6px;
                    color: #82916F;
                    font-size: 12px;
                    font-weight: 600;
                    letter-spacing: 1px;
                  ">
                    MERIDIAN
                  </p>

                  <p style="
                    margin: 0;
                    color: #A2A59D;
                    font-size: 11px;
                    line-height: 1.7;
                  ">
                    This is an automated security email.<br />
                    Please do not reply to this message.
                  </p>
                </td>
              </tr>
            </table>

            <p style="
              margin: 20px 0 0;
              color: #96998F;
              font-size: 11px;
              text-align: center;
            ">
              © MERIDIAN · Account Security
            </p>

          </td>
        </tr>
      </table>
    </body>
  </html>
`,
    });

    console.log("accepted:", info.accepted);
    console.log("rejected:", info.rejected);
    console.log("response:", info.response);
  } catch (error) {
    console.log(error);
    return res.status(500).json("server failed");
  }
});

route.post("/reset_password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (typeof token !== "string" || typeof password !== "string") {
      return res.status(400).json({ message: "Invalid request." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const result = await Pool.query(
      `SELECT id FROM users
       WHERE reset_token_hash = $1 AND reset_token_expires > NOW()`,
      [tokenHash]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "This reset link is invalid or has expired." });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await Pool.query(
      `UPDATE users
       SET password = $1,
           reset_token_hash = NULL,
           reset_token_expires = NULL
       WHERE id = $2`,
      [passwordHash, result.rows[0].id]
    );
    res.json({ message: "Password updated. You can now log in." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server failed." });
  }
});

export default route;
