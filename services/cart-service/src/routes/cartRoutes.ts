import { Router } from "express";
import { validate } from "../middleware/validate";
import { setCartItemSchema } from "../zod/cartSchemas";
import {
  getCart,
  setCartItemQuantity,
  clearCart,
} from "../controllers/cartController";
import { protect } from "../middleware/auth";

const router = Router();

router.use(protect);

router.route("/me").get(getCart).delete(clearCart);

router
  .route("/me/items")
  .post(validate(setCartItemSchema), setCartItemQuantity);

export default router;
