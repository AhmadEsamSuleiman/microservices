import express, { Request, Response, NextFunction } from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import { globalErrorHandler } from "./controllers/errorController";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";

// dotenv.config();

// const DB = process.env.DB || "mongodb://127.0.0.1:27017/micro_demo";
// const PORT = process.env.PORT || 3001;

const app = express();

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(helmet());

app.use((req, _res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true,
  });
  next();
});

app.use(mongoSanitize());
app.use(hpp());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: "fail", message: "too many requests" },
});
app.use("/api", limiter);

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);

export default app;
