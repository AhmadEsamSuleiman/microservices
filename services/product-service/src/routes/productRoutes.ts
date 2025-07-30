import { Router } from "express";
import { validate } from "../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
} from "../zod/productSchemas";
import {
  createProduct,
  getAllProducts,
  getProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController";
import { protect, restrictToOwner } from "../middleware/auth";

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getProduct);

router.use(protect);

router.post("/", validate(createProductSchema), createProduct);

router
  .route("/:id")
  .patch(restrictToOwner, validate(updateProductSchema), updateProduct)
  .delete(restrictToOwner, deleteProduct);

export default router;
