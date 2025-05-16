/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    whatsapp: { type: String, required: false },
    line: { type: String, required: false },
    facebook: { type: String, required: false },
    instagram: { type: String, required: false },
  },
  {
    _id: false,
    validate: {
      validator: function (v: any) {
        return v.whatsapp || v.line || v.facebook || v.instagram;
      },
      message: 'At least one contact method (whatsapp, line, facebook, or instagram) is required.',
    },
  }
);

const sellerSchema = new mongoose.Schema(
  {
    username: { type: String },
    email: { type: String },
    password: { type: String },
    contact: { type: contactSchema, required: true },
    store: {
      type: {
        name: { type: String },
        description: { type: String },
        logoUrl: { type: String },
        rating: { type: Number },
        credits: {
          positive: { type: Number },
          negative: { type: Number },
        },
      },
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Seller || mongoose.model('Seller', sellerSchema);
