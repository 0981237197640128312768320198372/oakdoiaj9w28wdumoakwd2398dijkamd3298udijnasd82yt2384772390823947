import { Schema, model, Document, Types, models } from 'mongoose';

interface IDigitalInventory extends Document {
  productId?: Types.ObjectId;
  sellerId: Types.ObjectId;
  inventoryGroup: string;
  digitalAssets: Array<Record<string, string>>;
  createdAt: Date;
  updatedAt: Date;
}

const digitalInventorySchema = new Schema<IDigitalInventory>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: false,
      index: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'Seller',
      required: true,
      index: true,
    },
    inventoryGroup: {
      type: String,
      required: true,
    },
    digitalAssets: [Schema.Types.Mixed],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

digitalInventorySchema.virtual('variantName').get(function () {
  return this.inventoryGroup;
});

digitalInventorySchema.virtual('variantName').set(function (name) {
  this.inventoryGroup = name;
});

digitalInventorySchema.index({ productId: 1, sellerId: 1 });

export const DigitalInventory =
  models.DigitalInventory || model<IDigitalInventory>('DigitalInventory', digitalInventorySchema);
