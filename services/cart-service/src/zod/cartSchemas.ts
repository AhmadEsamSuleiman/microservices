import { z } from "zod";

export const setCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "productId is required"),
    quantity: z.number().int().min(0, "quantity must be ≥ 0"),
  }),
});
