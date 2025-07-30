import { Router } from "express";
import { validate } from "../middleware/validate";
import { updateMeSchema, updatePasswordSchema } from "../zod/userSchemas";
import { protect, restrictTo } from "../controllers/authController";
import {
  getMe,
  updateMe,
  deleteMe,
  updateMyPassword,
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.use(protect);

router.get("/me", getMe);
router.patch(
  "/updateMyPassword",
  validate(updatePasswordSchema),
  updateMyPassword
);
router.patch("/updateMe", validate(updateMeSchema), updateMe);
router.delete("/deleteMe", deleteMe);

router.use(restrictTo("admin"));
router.get("/", getAllUsers);
router.get("/:id", getUser);
router.patch("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
