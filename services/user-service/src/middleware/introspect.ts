import { RequestHandler, Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { User } from "../models/userModel";

const JWT_SECRET: Secret = process.env.JWT_SECRET as Secret;

export const introspect: RequestHandler = async (
  req: Request,
  res: Response
) => {
  let token: string | undefined;
  if (req.body.token) {
    token = req.body.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(400).json({ active: false, message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      tokenVersion: number;
      iat: number;
    };
    const user = await User.findById(decoded.id).select(
      "+passwordChangedAt +tokenVersion"
    );
    if (
      !user ||
      user.tokenVersion !== decoded.tokenVersion ||
      user.changedPasswordAfter(decoded.iat)
    ) {
      res.json({ active: false });
      return;
    }
    res.json({ active: true, userId: user.id });
    return;
  } catch {
    res.json({ active: false });
    return;
  }
};
