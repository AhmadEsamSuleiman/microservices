import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import app from "./app";

const DB = process.env.DB || "mongodb://127.0.0.1:27017/micro_demo";
const PORT = process.env.PORT || 3001;

mongoose
  .connect(DB)
  .then(() => {
    console.log(`database connected at ${DB}`);

    app.listen(PORT, () => {
      console.log(`server listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("database connection failed:", err);
    process.exit(1);
  });
