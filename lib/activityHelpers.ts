/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Activity } from '@/models/v3/Activity';
import { Buyer } from '@/models/v3/Buyer';
import { Seller } from '@/models/v3/Seller';
import { Schema, Types } from 'mongoose';

export async function createPurchaseActivity(data: {
  buyerId: string;
  sellerId: string;
  productId: string;
  productName: string;
  amount: number;
  quantity: number;
  orderId?: string;
}) {
  const activity = await Activity.create({
    type: 'purchase',
    category: 'financial',
    actors: {
      primary: {
        id: new Schema.Types.ObjectId(data.buyerId),
        type: 'buyer',
      },
      secondary: {
        id: new Schema.Types.ObjectId(data.sellerId),
        type: 'seller',
      },
    },
    metadata: {
      amount: data.amount,
      currency: 'THB',
      productId: new Schema.Types.ObjectId(data.productId),
      productName: data.productName,
      quantity: data.quantity,
    },
    references: {
      order: data.orderId ? new Schema.Types.ObjectId(data.orderId) : undefined,
      product: new Schema.Types.ObjectId(data.productId),
    },
    status: 'pending',
  });

  await Buyer.findByIdAndUpdate(data.buyerId, {
    $push: { activities: activity._id },
  });

  await Seller.findByIdAndUpdate(data.sellerId, {
    $push: { activities: activity._id },
  });

  return activity;
}

export async function createDepositActivity(data: {
  buyerId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
}) {
  const activity = await Activity.create({
    type: 'deposit',
    category: 'financial',
    actors: {
      primary: {
        id: new Schema.Types.ObjectId(data.buyerId),
        type: 'buyer',
      },
    },
    metadata: {
      amount: data.amount,
      currency: 'THB',
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
    },
    status: 'pending',
  });

  await Buyer.findByIdAndUpdate(data.buyerId, {
    $push: { activities: activity._id },
  });

  return activity;
}

export async function createReviewActivity(data: {
  buyerId: string;
  sellerId: string;
  rating: number;
  comment?: string;
  orderId?: string;
}) {
  const activity = await Activity.createReview({
    buyerId: new Schema.Types.ObjectId(data.buyerId),
    sellerId: new Schema.Types.ObjectId(data.sellerId),
    rating: data.rating,
    comment: data.comment,
    orderId: data.orderId ? new Schema.Types.ObjectId(data.orderId) : undefined,
  });

  await Buyer.findByIdAndUpdate(data.buyerId, {
    $push: { activities: activity._id },
  });

  await Seller.findByIdAndUpdate(data.sellerId, {
    $push: { activities: activity._id },
  });

  const allReviews = await Activity.find({
    'actors.secondary.id': data.sellerId,
    type: 'review',
    status: 'completed',
  });

  const totalRating = allReviews.reduce((sum, review) => sum + (review.metadata.rating || 0), 0);
  const avgRating = totalRating / allReviews.length;

  await Seller.findByIdAndUpdate(data.sellerId, {
    'store.rating': avgRating,
  });

  return activity;
}

export async function createCreditActivity(data: {
  buyerId: string;
  sellerId: string;
  type: 'positive' | 'negative';
  value: number;
  reason?: string;
}) {
  const activity = await Activity.createCredit({
    buyerId: new Schema.Types.ObjectId(data.buyerId),
    sellerId: new Schema.Types.ObjectId(data.sellerId),
    type: data.type,
    value: data.value,
    reason: data.reason,
  });

  await Buyer.findByIdAndUpdate(data.buyerId, {
    $push: { activities: activity._id },
  });

  await Seller.findByIdAndUpdate(data.sellerId, {
    $push: { activities: activity._id },
  });

  const creditField =
    data.type === 'positive' ? 'store.credits.positive' : 'store.credits.negative';
  await Seller.findByIdAndUpdate(data.sellerId, {
    $inc: { [creditField]: data.value },
  });

  return activity;
}

export async function getUserActivities(
  userId: string,
  userType: 'buyer' | 'seller',
  options?: {
    category?: string;
    type?: string;
    limit?: number;
    skip?: number;
  }
) {
  const query: any = {};

  if (userType === 'buyer') {
    query['actors.primary.id'] = userId;
  } else {
    query.$or = [{ 'actors.primary.id': userId }, { 'actors.secondary.id': userId }];
  }

  if (options?.category) {
    query.category = options.category;
  }

  if (options?.type) {
    query.type = options.type;
  }

  return Activity.find(query)
    .sort({ createdAt: -1 })
    .limit(options?.limit || 20)
    .skip(options?.skip || 0);
}

export async function createLoginActivity(data: {
  userId: string;
  userType: 'buyer' | 'seller';
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    postal?: string;
    coordinate?: string;
  };
}) {
  const activity = await Activity.create({
    type: 'login',
    category: 'system',
    actors: {
      primary: {
        id: new Schema.Types.ObjectId(data.userId),
        type: data.userType,
      },
    },
    metadata: {
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      location: data.location,
    },
    status: 'completed',
    visibility: 'private',
  });

  const Model = data.userType === 'buyer' ? Buyer : Seller;
  await Model.findByIdAndUpdate(data.userId, {
    $push: { activities: activity._id },
  });

  return activity;
}

export async function createWithdrawalActivity(data: {
  buyerId: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string;
  bankAccount?: string;
}) {
  const activity = await Activity.create({
    type: 'withdrawal',
    category: 'financial',
    actors: {
      primary: {
        id: new Schema.Types.ObjectId(data.buyerId),
        type: 'buyer',
      },
    },
    metadata: {
      amount: data.amount,
      currency: 'THB',
      paymentMethod: data.paymentMethod,
      transactionId: data.transactionId,
      bankAccount: data.bankAccount,
    },
    status: 'pending',
  });

  await Buyer.findByIdAndUpdate(data.buyerId, {
    $push: { activities: activity._id },
  });

  return activity;
}

export async function createRegistrationActivity(data: {
  userId: string;
  userType: 'buyer' | 'seller';
  registrationMethod: 'personal_key' | 'credentials';
  ipAddress?: string;
  userAgent?: string;
  email: string;
  username?: string;
  name?: string;
}) {
  const activity = await Activity.create({
    type: 'registration',
    category: 'system',
    actors: {
      primary: {
        id: new Types.ObjectId(data.userId),
        type: data.userType,
        name: data.name,
      },
    },
    metadata: {
      registrationMethod: data.registrationMethod,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      email: data.email,
      username: data.username,
    },
    status: 'completed',
    visibility: 'private',
  });

  const Model = data.userType === 'buyer' ? Buyer : Seller;
  await Model.findByIdAndUpdate(data.userId, {
    $push: { activities: activity._id },
  });

  return activity;
}
