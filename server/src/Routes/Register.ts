import type { Request,Response } from "express";
import bcrypt  from "bcrypt"
import { Router } from "express";
const router=Router()
router.post("register",(req:Request,res:Response)=> {
    try {
const {username,email,password}=req.body
if (!username || !email || !password) {
  return res.status(400).json({ message: "Fill all fields" });
}



    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server error" });
    }
})