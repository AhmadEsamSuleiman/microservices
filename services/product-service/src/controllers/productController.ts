import { RequestHandler } from "express";
import { Product, IProduct } from "../models/productModel";

export const createProduct: RequestHandler = async (req, res, next) => {
  try {
    const { title, description, price, stock } = req.body;
    const createdBy = req.userId!;
    const product = await Product.create({
      title,
      description,
      price,
      stock,
      createdBy,
    });
    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const getAllProducts: RequestHandler = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      status: "success",
      results: products.length,
      data: { products },
    });
  } catch (err) {
    next(err);
  }
};

export const getProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ status: "fail", message: "Product not found" });
      return;
    }
    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const updateProduct: RequestHandler = async (req, res, next) => {
  try {
    const updates = (({ title, description, price, stock }) => ({
      title,
      description,
      price,
      stock,
    }))(req.body);

    const product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ status: "fail", message: "Product not found" });
      return;
    }
    res.status(200).json({ status: "success", data: { product } });
  } catch (err) {
    next(err);
  }
};

export const deleteProduct: RequestHandler = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      res.status(404).json({ status: "fail", message: "Product not found" });
      return;
    }
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};
