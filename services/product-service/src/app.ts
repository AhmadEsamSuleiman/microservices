import express from "express";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import productRoutes from "./routes/productRoutes";

// dotenv.config();

const app = express();

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

app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { status: "fail", message: "too many requests" },
});
app.use("/api", limiter);

app.use("/api/v1/products", productRoutes);

app.use(
  (
    err: any,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res
      .status(err.status || 500)
      .json({ status: "error", message: err.message || "Server Error" });
  }
);

export default app;
