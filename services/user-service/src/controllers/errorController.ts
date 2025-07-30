import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/appError";
import mongoose from "mongoose";

type AnyError = Error & {
  statusCode?: number;
  code?: string | number;
  keyValue?: any;
  name?: string;
  path?: string;
  value?: any;
};

const handleCastErrorDB = (err: AnyError): AppError =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateFieldsDB = (err: AnyError): AppError => {
  const fields = Object.keys(err.keyValue || {}).join(", ");
  return new AppError(`Duplicate field value: ${fields}`, 400);
};

const handleValidationErrorDB = (err: AnyError): AppError => {
  const messages = Object.values(
    (err as mongoose.Error.ValidationError).errors
  ).map((el: any) => el.message);
  return new AppError(`Validation error: ${messages.join(". ")}`, 400);
};

const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again.", 401);

const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired. Please log in again.", 401);

export const globalErrorHandler = (
  err: AnyError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  err.statusCode = err.statusCode || 500;
  const status = err.statusCode.toString().startsWith("4") ? "fail" : "error";

  let error = { ...err };
  error.message = err.message;

  if (err.name === "CastError") error = handleCastErrorDB(err);
  if (err.code === 11000) error = handleDuplicateFieldsDB(err);
  if (err.name === "ValidationError") error = handleValidationErrorDB(err);
  if (err.name === "JsonWebTokenError") error = handleJWTError();
  if (err.name === "TokenExpiredError") error = handleJWTExpiredError();

  res.status((error as AnyError).statusCode!).json({
    status,
    message: (error as AnyError).message,
  });
};
