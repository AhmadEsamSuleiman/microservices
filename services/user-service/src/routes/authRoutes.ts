import { Router } from "express";
import { validate } from "../middleware/validate";
import { signupSchema, signinSchema } from "../zod/userSchemas";
import {
  signup,
  signin,
  logout,
  refreshToken,
} from "../controllers/authController";
import { introspect } from "../middleware/introspect";

const router = Router();

router.post("/signup", validate(signupSchema), signup);
router.post("/signin", validate(signinSchema), signin);
router.post("/refresh", refreshToken);
router.get("/logout", logout);
router.post("/introspect", introspect);

export default router;
