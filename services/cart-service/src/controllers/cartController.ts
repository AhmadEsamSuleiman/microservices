import { RequestHandler } from "express";
import { pool } from "../config/db";

interface CartItem {
  id: number;
  product_id: string;
  quantity: number;
}

export const getCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId!;
    const cartRes = await pool.query(
      `INSERT INTO carts (user_id) VALUES ($1)
       ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
       RETURNING id`,
      [userId]
    );
    const cartId = cartRes.rows[0].id;

    const itemsRes = await pool.query<CartItem>(
      `SELECT id, product_id, quantity FROM cart_items WHERE cart_id = $1`,
      [cartId]
    );

    res.status(200).json({
      status: "success",
      data: { cartId, items: itemsRes.rows },
    });
  } catch (err) {
    next(err);
  }
};

export const setCartItemQuantity: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId!;
    const { productId, quantity } = req.body as {
      productId: string;
      quantity: number;
    };

    if (!productId || quantity < 0) {
      res.status(400).json({
        status: "fail",
        message: "Invalid productId or quantity (must be >= 0)",
      });
      return;
    }

    const cartRes = await pool.query(
      `
      INSERT INTO carts (user_id)
      VALUES ($1)
      ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
      RETURNING id
    `,
      [userId]
    );
    const cartId = cartRes.rows[0].id;

    if (quantity === 0) {
      const result = await pool.query(
        `
        DELETE FROM cart_items
        WHERE product_id = $1 AND cart_id = $2
        RETURNING id
      `,
        [productId, cartId]
      );

      if (result.rowCount === 0) {
        res.status(404).json({
          status: "fail",
          message: "Item not found or already removed",
        });
        return;
      }

      res.status(204).json({ status: "success", data: null });
      return;
    }

    const itemRes = await pool.query<CartItem>(
      `
      INSERT INTO cart_items (cart_id, product_id, quantity)
      VALUES ($1, $2, $3)
      ON CONFLICT (cart_id, product_id)
      DO UPDATE SET quantity = EXCLUDED.quantity
      RETURNING id, product_id, quantity
    `,
      [cartId, productId, quantity]
    );

    res.status(200).json({
      status: "success",
      data: { item: itemRes.rows[0] },
    });
  } catch (err) {
    next(err);
  }
};

export const clearCart: RequestHandler = async (req, res, next) => {
  try {
    const userId = req.userId!;
    await pool.query(
      `DELETE FROM cart_items
       WHERE cart_id = (SELECT id FROM carts WHERE user_id = $1)`,
      [userId]
    );
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};
