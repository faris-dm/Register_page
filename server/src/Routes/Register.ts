import express from "express"
import type { Request,Response } from "express";
import bcrypt  from "bcrypt"
import Pool from "../config/db.js";
import { Router } from "express";
import  jwt from "jsonwebtoken"
import cookieParser from "cookie-parser";

const router=Router()
router.use(express.urlencoded({ extended: true }));
router.use(cookieParser());
router.use(express.json());


const secret = process.env.AccessSecret as  string;
const refreshSecret = process.env.refreshSecret as string;

const generateAccess=(accessInputs:any):string=> {
  return jwt.sign(accessInputs, secret, { expiresIn: "15m" });
}

const geneateRefresh=(refreshInput:any):string => {
  return jwt.sign(refreshInput,refreshSecret,{expiresIn:"7d"})
}



                //  https://www.figma.com/design/0zf7EfwkdTxHP8fFh1O3uG/Course-Selling-Website--Community-?node-id=0-1&p=f&t=t5i17zRQd5jAs76J-0            

// https://www.figma.com/design/FfvQPAsnJpaVQjSzUDCN6h/Destinize---Travel-Website-Landing-Page--Community-?node-id=0-1&p=f&t=LpkBqkVrV0QpCUuK-0



// https://www.figma.com/design/YCneKQPX30u7cgftgXVAsp/Effortless-Travel-UI-%25E2%2580%2593-Flight-Booking-Website--Community-?node-id=0-1&p=f&t=xqvCT2zcSCRge4MM-0
// get the user

//  this was  the post route  for the register
router.post("register", async (req:Request,res:Response)=> {
    try {
const {username,email,password}=req.body
if (!username || !email || !password) {
  return res.status(400).json({ message: "Fill all fields" });
}

const selectQuery= await Pool.query(`
  SELECT *  FROM  users  WHERE  email=$1`,[email])

  const Result= selectQuery.rows.length
  if(Result > 0) {
    return res.status(409).json({message:"email aready exist"})
  }

  const hashPassword=await bcrypt.hash(password,10)
  const saveUser=await Pool.query(`
     INSERT INTO users (username,email,password)   VALUES ($1,$2,$3) RETURNING id,username,email
    `,[username,email,hashPassword])

    const finalResult=saveUser.rows[0]



const accessInputs={
  id:finalResult.id,
  email:finalResult.email
}

const refreshInput={
  id:finalResult.id 
}

const accessToknes=generateAccess(accessInputs)
const refreshTokens=geneateRefresh(refreshInput)
 await Pool.query(
  `
 INSERT INTO  refresh_tokens (user_id,token)  VALLUES ($1,$2) RETURNING id,user_id,token`,[finalResult.id,refreshTokens]
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

 return res.status(200).json({
   success: true,
   message: "registed succefully",
   user: finalResult,
 });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
})


router.post("/login", async (req:Request,res:Response)=> {
try {
    const { email, password } = req.body;
     if (!email || !password) {
       return res.status(401).json("incorrect inputs ");
     }

     const selectUserInfo=await Pool.query(`
        SELECT * FROM  users WHERE  email=$1  
         `,[email])

          if (selectUserInfo.rows.length === 0) {
            return res.status(401).json("incorrect inputs ");
          }

          const full_Info=selectUserInfo.rows[0]
    const comparePassword=bcrypt.compare(password,full_Info.hashPassword)
    
    
    
    
    if (!comparePassword) {
        return res.status(401).json("incorrect inputs");
      }

      const accessInputs={
        id:full_Info.id,
        email:full_Info.email,
      }
      const refreshInput={
        id:full_Info.id
      }

      const accessToknes=generateAccess(accessInputs)
      const refresh_tokens=geneateRefresh(refreshInput)
         console.log(accessToknes, "accesstokens");

         await Pool.query(` INSERT INTO refresh_tokens (user_id,token) VALUES ($1,$2) `,[full_Info.id,refresh_tokens]);
     
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

})

