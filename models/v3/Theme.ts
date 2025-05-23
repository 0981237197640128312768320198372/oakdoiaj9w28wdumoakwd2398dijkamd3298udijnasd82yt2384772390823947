import { Schema, model, models, Types } from 'mongoose';

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
      primary: { type: String, default: '#B9FE13' },
      secondary: { type: String, default: '#0F0F0F' },
    },
    button: {
      textColor: { type: String, default: '#0F0F0F' },
      backgroundColor: { type: String, default: '#B9FE13' },
      roundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'md',
      },
      shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
      border: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'none' },
      borderColor: { type: String, default: '#B9FE13' },
    },
    componentStyles: {
      cardRoundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'md',
      },
      cardShadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
    },
    ads: {
      imageUrl: { type: String, default: null },
      roundedness: {
        type: String,
        enum: ['none', 'sm', 'md', 'lg', 'full'],
        default: 'md',
      },
      shadow: { type: String, enum: ['none', 'sm', 'md', 'lg'], default: 'sm' },
    },
  },
});

export const Theme = models.Theme || model<ITheme>('Theme', themeSchema);
