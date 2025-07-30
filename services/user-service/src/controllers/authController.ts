import { RequestHandler } from "express";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { User, IUser } from "../models/userModel";
import { catchAsync } from "../utils/catchAsync";
// import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { RefreshToken } from "../models/refreshTokenModel";
import {
  parseTimespanToMilliSeconds,
  parseTimespanToSeconds,
} from "../utils/parseTime";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN!;

function signAccessToken(user: IUser): string {
  return jwt.sign(
    { id: user._id, tokenVersion: user.tokenVersion },
    JWT_SECRET,
    {
      expiresIn: parseTimespanToSeconds(JWT_EXPIRES_IN),
    }
  );
}

async function createRefreshToken(user: IUser) {
  const token = uuidv4();
  const expiresAt = new Date(
    Date.now() + parseTimespanToMilliSeconds(REFRESH_EXPIRES)
  );
  await RefreshToken.create({ token, user: user._id, expiresAt });
  return token;
}

export async function sendTokens(user: IUser, statusCode: number, res: any) {
  const accessToken = signAccessToken(user);
  const refreshToken = await (user.id && createRefreshToken(user));

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: parseTimespanToMilliSeconds(JWT_EXPIRES_IN),
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: parseTimespanToMilliSeconds(REFRESH_EXPIRES),
  });

  user.password = undefined as any;
  res.status(statusCode).json({
    status: "success",
    data: { user },
  });
}

export const signup: RequestHandler = catchAsync(async (req, res, next) => {
  const { username, email, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    username,
    email,
    password,
    passwordConfirm,
  });
  await sendTokens(newUser, 201, res);
});

export const signin: RequestHandler = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res
      .status(400)
      .json({ status: "fail", message: "Provide email & password" });
    return;
  }
  const user = (await User.findOne({ email }).select(
    "+password"
  )) as IUser | null;
  if (!user || !(await user.correctPassword(password, user.password))) {
    res.status(401).json({ status: "fail", message: "Invalid credentials" });
    return;
  }
  await sendTokens(user, 201, res);
});

export const refreshToken: RequestHandler = catchAsync(
  async (req, res, next) => {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      res.status(401).json({ status: "fail", message: "No refresh token" });
      return;
    }

    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored || stored.expiresAt < new Date()) {
      res.status(401).json({
        status: "fail",
        message: "Refresh token invalid or expired",
      });
      return;
    }

    const userId = stored.user.toString();
    const user = await User.findById(userId);

    await stored.deleteOne();

    if (!user) {
      res
        .status(401)
        .json({ status: "fail", message: "User no longer exists" });
      return;
    }

    const newRT = await createRefreshToken(user);

    const newAT = signAccessToken(user);

    res.cookie("accessToken", newAT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: parseTimespanToMilliSeconds(JWT_EXPIRES_IN),
    });
    res.cookie("refreshToken", newRT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: parseTimespanToMilliSeconds(REFRESH_EXPIRES),
    });

    res.json({ status: "success" });
  }
);

export const logout: RequestHandler = async (req, res) => {
  const { refreshToken } = req.cookies;
  if (refreshToken) await RefreshToken.deleteOne({ token: refreshToken });

  if (req.user) {
    await User.findByIdAndUpdate(req.user.id, { $inc: { tokenVersion: 1 } });
  }

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.status(200).json({ status: "success" });
};

export const protect: RequestHandler = catchAsync(async (req, res, next) => {
  let token: string | undefined;
  if (req.headers.authorization?.startsWith("Bearer "))
    token = req.headers.authorization.split(" ")[1];
  else if (req.cookies.accessToken) token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ status: "fail", message: "Not logged in" });
    return;
  }

  const decoded = jwt.verify(token, JWT_SECRET) as {
    id: string;
    iat: number;
  };
  const user = await User.findById(decoded.id);
  if (!user) {
    res.status(401).json({ status: "fail", message: "User no longer exists" });
    return;
  }
  if (user.changedPasswordAfter(decoded.iat)) {
    res
      .status(401)
      .json({ status: "fail", message: "Password recently changed" });
    return;
  }

  req.user = user;
  next();
});

export const restrictTo =
  (...allowedRoles: string[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role!)) {
      res.status(403).json({ status: "fail", message: "Forbidden" });
      return;
    }
    next();
  };
