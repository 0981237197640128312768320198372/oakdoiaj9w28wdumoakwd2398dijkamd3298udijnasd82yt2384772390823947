import { Schema, model, models, type Types } from 'mongoose';

interface ITheme {
  sellerId: Types.ObjectId;
  baseTheme: 'light' | 'dark';
  customizations: {
    colors: {
      primary?: string;
      secondary?: string;
    };
    button: {
      textColor?: string;
      backgroundColor?: string;
      roundedness?: 'none' | 'sm' | 'md' | 'lg' | 'full';
      shadow?: 'none' | 'sm' | 'md' | 'lg';
      border?: 'none' | 'sm' | 'md' | 'lg';
      borderColor?: string;
    };
    componentStyles: {
      cardRoundedness?: 'none' | 'sm' | 'md' | 'lg' | 'full';
      cardShadow?: 'none' | 'sm' | 'md' | 'lg';
    };
    ads: {
      imageUrl?: string | null;
      roundedness?: 'none' | 'sm' | 'md' | 'lg' | 'full';
      shadow?: 'none' | 'sm' | 'md' | 'lg';
    };
  };
}

const themeSchema = new Schema<ITheme>({
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'Seller',
    required: true,
  },
  baseTheme: {
    type: String,
    enum: ['light', 'dark'],
    default: 'light',
    required: true,
  },
  customizations: {
    colors: {
      primary: { type: String, default: 'primary' },
      secondary: { type: String, default: 'bg-dark-800' },
    },
    button: {
      textColor: { type: String, default: 'text-dark-800' },
      backgroundColor: { type: String, default: 'bg-primary' },
      roundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'full',
      },
      shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
      border: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'none' },
      borderColor: { type: String, default: 'border-primary' },
    },
    componentStyles: {
      cardRoundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'lg',
      },
      cardShadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
    },
    ads: {
      images: { type: [String], default: [] },
      roundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'lg',
      },
      shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
    },
  },
});

export const Theme = models.Theme || model<ITheme>('Theme', themeSchema);
