import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import axios from "axios";

const JWT_SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = process.env.JWT_COOKIE_NAME || "jwt";

export const authSetup = cookieParser();

export const protect: RequestHandler = async (req, res, next) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.accessToken) token = req.cookies.jwt;

    if (!token) {
      res.status(401).json({ status: "fail", message: "Not logged in" });
      return;
    }

    const introspectRes: any = await axios.post(
      `${process.env.USER_SERVICE_URL}/api/v1/auth/introspect`,
      { token }
    );

    if (!introspectRes.data.active) {
      res
        .status(401)
        .json({ status: "fail", message: "Invalid or expired token" });
      return;
    }

    req.userId = introspectRes.data.userId;
    next();
  } catch (err) {
    res
      .status(500)
      .json({ status: "error", message: "Auth service unreachable" });
    return;
  }
};
