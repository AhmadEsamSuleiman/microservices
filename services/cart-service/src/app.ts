import express from "express";
import dotenv from "dotenv";
import { authSetup } from "./middleware/auth";
import cartRoutes from "./routes/cartRoutes";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";
import hpp from "hpp";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();

app.use(helmet());

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

app.use(authSetup);

app.use("/api/v1/carts", cartRoutes);

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
