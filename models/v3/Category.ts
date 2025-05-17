import { Schema, model, Document } from 'mongoose';

interface ICategory extends Document {
  name: string;
  description: string;
  logoUrl: string;
  parentId?: string;
}

const categorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  logoUrl: { type: String },
  parentId: { type: Schema.Types.ObjectId, ref: 'Category' },
});

export const Category = model<ICategory>('Category', categorySchema);
