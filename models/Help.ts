import { Schema, model, Document } from 'mongoose';

interface IHelpStep {
  step: string;
  description: string;
  picture: Buffer;
  pictureMimeType: string;
}
interface IHelp extends Document {
  id: string;
  title: string;
  steps: IHelpStep[];
}

const HelpStepSchema = new Schema<IHelpStep>({
  step: { type: String, required: true },
  description: { type: String, required: true },
  picture: { type: Buffer, required: true },
  pictureMimeType: { type: String, required: true },
});

const HelpSchema = new Schema<IHelp>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  steps: [HelpStepSchema],
});

const Help = model<IHelp>('Help', HelpSchema);

export default Help;
