import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Product } from "../models/productModel";
import axios from "axios";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

const JWT_SECRET = process.env.JWT_SECRET!;

export const protect: RequestHandler = async (req, res, next) => {
  try {
    let token: string | undefined;
    if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];
    else if (req.cookies.accessToken) token = req.cookies.accessToken;

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

export const restrictToOwner: RequestHandler = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || product.createdBy.toString() !== req.userId) {
      res.status(403).json({ status: "fail", message: "Not authorized" });
      return;
    }
    next();
  } catch (err) {
    next(err);
  }
};
