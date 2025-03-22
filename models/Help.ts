import { Schema, model, Document } from 'mongoose';

// Define the HelpStep interface
interface IHelpStep {
  step: string;
  description: string;
  picture: Buffer;
  pictureMimeType: string;
}

// Define the Help interface
interface IHelp extends Document {
  id: string; // Custom ID field
  title: string;
  steps: IHelpStep[];
}

// HelpStep schema
const HelpStepSchema = new Schema<IHelpStep>({
  step: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: Buffer, required: true }, // Store image as binary data
  pictureMimeType: { type: String, required: true }, // Store MIME type
});

// Help schema
const HelpSchema = new Schema<IHelp>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  steps: [HelpStepSchema],
});

const Help = model<IHelp>('Help', HelpSchema);

export default Help;
