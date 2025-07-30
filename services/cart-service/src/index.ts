import dotenv from "dotenv";
dotenv.config();

import "./config/db";
import app from "./app";

const port = process.env.PORT || 3002;
app.listen(port, () => {
  console.log(`cart-service listening on port ${port}`);
});
