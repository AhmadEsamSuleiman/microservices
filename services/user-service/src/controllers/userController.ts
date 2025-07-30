import { RequestHandler } from "express";
import { User, IUser } from "../models/userModel";
import { RefreshToken } from "../models/refreshTokenModel";
import jwt, { SignOptions, Secret } from "jsonwebtoken";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/appError";
import { sendTokens } from "./authController";
// import {
//   parseTimespanToMilliSeconds,
//   parseTimespanToSeconds,
// } from "../utils/parseTime";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN!;
const REFRESH_EXPIRES = process.env.REFRESH_EXPIRES_IN!;

const filterObj = (obj: any, ...allowedFields: string[]) => {
  const newObj: any = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};

export const getMe: RequestHandler = (req, res) => {
  res.status(200).json({ status: "success", data: { user: req.user } });
};

export const updateMe: RequestHandler = catchAsync(async (req, res, next) => {
  const filtered = filterObj(req.body, "username", "email");
  const updated = await User.findByIdAndUpdate(req.user!.id, filtered, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: "success", data: { user: updated } });
});

export const deleteMe: RequestHandler = async (req, res) => {
  await User.findByIdAndDelete(req.user!.id);
  res.status(204).json({ status: "success", data: null });
};

export const updateMyPassword: RequestHandler = catchAsync(
  async (req, res, next) => {
    const user = (await User.findById(req.user!.id).select(
      "+password +tokenVersion"
    )) as IUser;
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (
      !(await user.correctPassword(req.body.currentPassword, user.password!))
    ) {
      return next(new AppError("Wrong current password", 401));
    }

    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.newPasswordConfirm;

    user.tokenVersion++;

    await user.save();

    await RefreshToken.deleteMany({ user: user._id });

    await sendTokens(user, 200, res);
  }
);

export const getAllUsers: RequestHandler = async (_req, res) => {
  const users = await User.find();
  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
};

export const getUser: RequestHandler = async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404).json({ status: "fail", message: "No user found" });
    return;
  }
  res.status(200).json({ status: "success", data: { user } });
};

export const updateUser: RequestHandler = async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    res.status(404).json({ status: "fail", message: "No user to update" });
    return;
  }
  res.status(200).json({ status: "success", data: { user } });
};

export const deleteUser: RequestHandler = async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
};
