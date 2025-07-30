import mongoose, { Types, Document, Model, Schema } from "mongoose";

export interface IProduct extends Document {
  title: string;
  description: string;
  price: number;
  stock: number;
  createdBy: Types.ObjectId;
}

interface IProductModel extends Model<IProduct> {}

const productSchema = new Schema<IProduct>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    createdBy: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct, IProductModel>(
  "Product",
  productSchema
);
