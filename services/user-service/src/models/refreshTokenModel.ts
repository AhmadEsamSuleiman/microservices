import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRefreshToken extends Document {
  token: string;
  user: mongoose.Types.ObjectId;
  expiresAt: Date;
}

interface IRefreshTokenModel extends Model<IRefreshToken> {}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    token: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const RefreshToken = mongoose.model<IRefreshToken, IRefreshTokenModel>(
  "RefreshToken",
  refreshTokenSchema
);
