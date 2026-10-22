import express from "express";
import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import Pool from "../config/db.js";
import { Router } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import NodeMailer from "nodemailer";
import { randomInt,createHash } from "crypto";
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

 function hastOTp(otp:string) :string {
  return createHash("sha256").update(otp).digest("hex")
 }


 function generateOtp(): string {
   return randomInt(100000, 1000000).toString();
 }

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
 const normalizedEmail = email.trim().toLowerCase();
    const selectQuery = await Pool.query(
      `
  SELECT *  FROM  users  WHERE  email=$1`,
      [normalizedEmail]
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

 


    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now
    const otpHashs=hastOTp(otp)


    
    const addOTPQuery = await Pool.query(
      `INSERT INTO  otp_table  (user_id,otp,expires_at)VALUES ($1,$2,$3) `,
      [finalResult.id, otpHashs, expiresAt]
    );

       const sendOtp = NodeMailer.createTransport({
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

    let emailOTP = await sendOtp.sendMail({
      from: process.env.Owner_EMAIL,
      to:finalResult.email,
      subject: "your email verfication OTP",
      text: `enter this code ${otp} it will exprese in five minutes`,
    });


    console.log(otp);
    console.log(`otp accepted`, emailOTP.accepted);
    console.log(`otp accepted`, emailOTP.rejected);
    console.log(`otp accepted`, emailOTP.response);

    // const accessInputs = {
    //   id: finalResult.id,
    //   email: finalResult.email,
    // };

    // const refreshInput = {
    //   id: finalResult.id,
    // };

    // const accessToknes = generateAccess(accessInputs);
    // console.log(accessToknes);
    // const refreshTokens = geneateRefresh(refreshInput);
//     await Pool.query(
//       `
//  INSERT INTO  refresh_tokens (user_id,token,done_date)  VALUES ($1,$2,$3) RETURNING id,user_id,token`,
//       [
//         finalResult.id,
//         refreshTokens,
//         new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
//       ]
//     );

//     res.cookie("token", accessToknes, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshTokens, {
//       httpOnly: true,
//       secure: true,
//       sameSite: "none",
//       maxAge: 7 * 24 * 60 * 60 * 1000,
//     });

    return res.status(201).json({
      success: true,
      message: "registed succefully Check your email",
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

    if (refreshToken) {
      await Pool.query(`DELETE FROM refresh_tokens WHERE token=$1`, [
        refreshToken,
      ]);
    }

    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: "none" as const,
    };
    res.clearCookie("token", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "server failed" });
  }
});

router.post("/password/reset", async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const CheckEmail = await Pool.query(
      ` SELECT  * FROM users  WHERE email=$1`,
      [email]
    );
    if (!CheckEmail) {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {}
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


router.post("/otp", async (req,res)=> {
  const {otp,email} =req.body
  try {
    if (
      typeof email !== "string" ||
      typeof otp !== "string" ||
      !/^\d{6}$/.test(otp)
    ) {
      return res.status(400).json({
        message: "Enter your email and six-digit OTP",
      });
    }

    const selectOTP = await Pool.query(
      ` SELECT otp_table.id,otp_table.otp,users.id,otp_table.expires_at FROM otp_table  JOIN  users ON users.id=otp_table.user_id WHERE users.email=$1  
         AND users.email_verified = FALSE
       ORDER BY otp_table.id DESC
       LIMIT 1
       FOR UPDATE OF  otp_table  `,
      [email.trim().toLocaleLowerCase()]
    );

    if (selectOTP.rows.length === 0) {
      return res
        .status(409)
        .json({ message: "Invalid OTP or no pending verification" });
    }

    const saveOtp = selectOTP.rows[0];

    if (new Date(saveOtp.expires_at).getTime() <= Date.now()) {
      await Pool.query(`DELETE FROM otp_table WHERE user_id = $1`, [
        saveOtp.user_id,
      ]);

      const submittedOtpHash = hastOTp(otp);

      if (submittedOtpHash !== saveOtp.otp) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }
    }

    // Mark the user's email as verified.
    const verifiedUser = await Pool.query(
      `UPDATE users
       SET email_verified = TRUE
       WHERE id = $1
       RETURNING id, username, email`,
      [saveOtp.user_id]
    );
    const user = verifiedUser.rows[0];
// delete all the user otps so no users use them after that
    await Pool.query(`DELETE FROM otp_table WHERE user_id = $1`, [user.id]);


const accessToken = generateAccess({
  id: user.id,
  email: user.email,
});

const refreshToken = geneateRefresh({
  id: user.id,
});





 await Pool.query(
   `INSERT INTO refresh_tokens (user_id, token, done_date)
       VALUES ($1, $2, $3)`,
   [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)]
 );

 const isProduction = process.env.NODE_ENV === "production";

   res.cookie("token", accessToken, {
     httpOnly: true,
     secure: isProduction,
     sameSite: isProduction ? "none" : "lax",
     maxAge: 15 * 60 * 1000,
   });

   res.cookie("refreshToken", refreshToken, {
     httpOnly: true,
     secure: isProduction,
     sameSite: isProduction ? "none" : "lax",
     maxAge: 7 * 24 * 60 * 60 * 1000,
   });
     return res.status(200).json({
       success: true,
       message: "Email verified successfully",
       user,
     });
  } catch (error) {
    console.log(error);
    return res.status(500).json("server failed");
  }
})

export default router;
