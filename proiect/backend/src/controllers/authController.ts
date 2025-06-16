import {Request, Response} from "express";
import jwt from "jsonwebtoken";
import db from "../db";
import { User } from "../types/userTypes";
import dotenv from "dotenv";
import {OtpRecord} from "../types/requestTypes";
import nodemailer from "nodemailer";

dotenv.config();

export const JWT_SECRET  = process.env.JWT_SECRET as string;

export const requestOtp = async (req: Request, res: Response): Promise<void> => {
  const email = req.body.email?.trim().toLowerCase();

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  db.prepare(`
    INSERT OR REPLACE INTO otps (email, code, expires_at)
    VALUES (?, ?, ?)
  `).run(email, code, expiresAt);

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    await transporter.sendMail({
      from: `"Your App Name" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is: ${code}`,
      html: `<p>Your OTP code is: <b>${code}</b></p>`
    });

    res.json({ message: "OTP sent via email" });

  } catch (error) {
    console.error("Failed to send email:", error);
    res.status(500).json({ error: "Failed to send OTP email" });
  }
};


export const verifyOtp = (req: Request, res: Response): void => {
  const email = req.body.email?.trim().toLowerCase();
  const code = req.body.code;

  if (!email || !code) {
    res.status(400).json({ error: "Email and OTP code are required" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: "Invalid email format" });
    return;
  }

  const record = db
    .prepare("SELECT * FROM otps WHERE email = ? AND code = ?")
    .get(email, code) as OtpRecord | undefined;

  if (!record || Date.now() > record.expires_at) {
    res.status(401).json({ error: "Invalid or expired OTP" });
    return;
  }

  // OTP is valid → remove it
  db.prepare("DELETE FROM otps WHERE email = ?").run(email);

  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email) as User | undefined;

    if (user) {
      const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "1000h" });
    
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          profile_picture: user.profile_picture || "",
        },
        newUser: false,
      })
  } else {
    // Insert new user with only email
    const result = db
    .prepare("INSERT INTO users (email, name, profile_picture) VALUES (?, ?, ?)")
    .run(email, "", "");
    
  
    const userId = result.lastInsertRowid as number;
  
    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "1000h" });
  
    res.json({
      token,
      user: {
        id: userId,
        email,
        name: "",              // default empty
        profile_picture: "",   // default empty
      },
      newUser: true,
    });
  }
};
