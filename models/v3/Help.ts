import { Schema, model, Document } from 'mongoose';

interface IHelpStep {
  step: string;
  description: string;
  imageUrl: string;
}

interface IHelp extends Document {
  title: string;
  description: string;
  categories: string[];
  steps: IHelpStep[];
  createdAt: Date;
  updatedAt: Date;
}

const HelpStepSchema = new Schema<IHelpStep>({
  step: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, required: true },
});

const HelpSchema = new Schema<IHelp>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categories: [{ type: String }],
  steps: [HelpStepSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Update the updatedAt field before saving
HelpSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export const Help = model<IHelp>('Help', HelpSchema);
