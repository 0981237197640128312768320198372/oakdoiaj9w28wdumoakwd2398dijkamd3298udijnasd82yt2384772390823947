import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    whatsapp: String,
    line: String,
    facebook: String,
    instagram: String,
  },
  { _id: false }
);
contactSchema.pre('validate', function (next) {
  if (!this.whatsapp && !this.line && !this.facebook && !this.instagram) {
    next(new Error('At least one contact method is required'));
  } else {
    next();
  }
});
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String },
  password: { type: String },
  personalKey: {
    type: String,
    unique: true,
    validate: {
      validator: function (v: string) {
        return /^(?=(.*[a-zA-Z]){4})(?=(.*\d){4})[a-zA-Z\d]{8}$/.test(v);
      },
      message: 'personalKey must be 8 characters with exactly 4 letters and 4 numbers',
    },
  },
  name: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  avatarUrl: {
    type: String,
    trim: true,
    validate: {
      validator: function (v: string) {
        if (!v) return true; // Allow empty values
        return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i.test(v);
      },
      message: 'avatarUrl must be a valid image URL',
    },
  },
  roles: [{ type: String, enum: ['buyer', 'seller'] }],
  contact: contactSchema,
  shop: {
    name: { type: String },
    description: { type: String },
    logoUrl: { type: String },
    rating: { type: Number },
  },
  credits: {
    positive: { type: Number },
    negative: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre('save', function (next) {
  if (this.username && !this.password) {
    next(new Error('Password is required if username is provided'));
  } else if (!this.personalKey && !this.username) {
    next(new Error('Must provide either personalKey or username and password'));
  } else {
    next();
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
