import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Order } from '@/models/v3/Order';
import { Product } from '@/models/v3/Product';
import { Buyer } from '@/models/v3/Buyer';
import { Balance } from '@/models/v3/Balance';
import { DigitalInventory } from '@/models/v3/DigitalInventory';
import { Transaction } from '@/models/v3/Transaction';
import { Activity } from '@/models/v3/Activity';
import { Types } from 'mongoose';
import { headers } from 'next/headers';
import { formatPrice, roundToTwo, safeAdd, safeSubtract, safeMultiply } from '@/lib/utils';
import { ReviewService } from '@/lib/services/reviewService';

interface CartItem {
  productId: string;
  quantity: number;
}

interface CreateOrderRequest {
  buyerId: string;
  items: CartItem[];
}

interface OrderItem {
  product: {
    _id: string;
    title: string;
    price: number;
    discountPercentage: number;
    _stock: number;
  };
  quantity: number;
}

interface SellerGroup {
  seller: {
    lineUserId: string;
    _id: string;
    username: string;
    store: {
      name: string;
    };
  };
  items: OrderItem[];
}

interface CartItemForOrder {
  productId: string;
  productTitle: string;
  quantity: number;
  price: number;
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const { buyerId, items }: CreateOrderRequest = await request.json();

    // Validation
    if (!buyerId || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: buyerId, items' },
        { status: 400 }
      );
    }

    // Validate buyerId format
    if (!Types.ObjectId.isValid(buyerId)) {
      return NextResponse.json({ error: 'Invalid buyerId format' }, { status: 400 });
    }

    // Get request metadata
    const headersList = await headers();
    const ipAddress =
      headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
    const userAgent = headersList.get('user-agent') || 'unknown';

    // Verify buyer exists
    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return NextResponse.json({ error: 'Buyer not found' }, { status: 404 });
    }

    // Get buyer's wallet balance
    const walletBalance = await Balance.findOrCreateBalance(
      new Types.ObjectId(buyerId),
      'buyer',
      'wallet'
    );

    if (!walletBalance) {
      return NextResponse.json({ error: 'Failed to access buyer balance' }, { status: 500 });
    }

    // Fetch all products and validate
    const productIds = items.map((item) => item.productId);
    const products = await Product.find({
      _id: { $in: productIds },
      status: 'active',
    }).populate('sellerId');

    if (products.length !== items.length) {
      return NextResponse.json({ error: 'Some products not found or inactive' }, { status: 400 });
    }

    // Group items by seller (ensure single seller per order)
    const sellerGroups = new Map<string, SellerGroup>();

    for (const item of items) {
      const product = products.find((p) => p._id.toString() === item.productId);
      if (!product) continue;

      const sellerId = product.sellerId._id.toString();

      if (!sellerGroups.has(sellerId)) {
        sellerGroups.set(sellerId, { seller: product.sellerId, items: [] });
      }

      sellerGroups.get(sellerId)!.items.push({
        product,
        quantity: item.quantity,
      });
    }

    // Validate single seller constraint
    if (sellerGroups.size > 1) {
      return NextResponse.json(
        { error: 'Orders must contain items from a single seller only' },
        { status: 400 }
      );
    }

    const [sellerGroup] = sellerGroups.values();
    const { seller, items: orderItems } = sellerGroup;

    // Calculate total and validate stock
    let totalAmount = 0;
    const cartItems: CartItemForOrder[] = [];

    for (const { product, quantity } of orderItems as OrderItem[]) {
      // Check stock availability
      if (product._stock < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product: ${product.title}` },
          { status: 400 }
        );
      }

      // Calculate price (with discount if applicable) using safe arithmetic
      const unitPrice =
        product.discountPercentage > 0
          ? safeMultiply(product.price, safeSubtract(1, product.discountPercentage / 100))
          : roundToTwo(product.price);

      const itemTotal = safeMultiply(unitPrice, quantity);
      totalAmount = safeAdd(totalAmount, itemTotal);

      cartItems.push({
        productId: product._id.toString(),
        productTitle: product.title,
        quantity,
        price: unitPrice,
      });
    }

    // Check buyer balance
    if (walletBalance.amount < totalAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    // Start the new reserve-then-commit flow
    try {
      // Step 1: Reserve balance (create reserved balance entry)
      await Balance.findOrCreateBalance(new Types.ObjectId(buyerId), 'buyer', 'reserved');

      // Check if buyer has enough in wallet to reserve
      if (walletBalance.amount < totalAmount) {
        return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
      }

      // Transfer from wallet to reserved
      await Balance.updateBalance(
        new Types.ObjectId(buyerId),
        'buyer',
        totalAmount,
        'wallet',
        'subtract'
      );

      await Balance.updateBalance(
        new Types.ObjectId(buyerId),
        'buyer',
        totalAmount,
        'reserved',
        'add'
      );

      // Step 2: Reserve stock (reduce available stock)
      const stockReservations: Array<{ productId: string; quantity: number }> = [];

      for (const { product, quantity } of orderItems as OrderItem[]) {
        await Product.findByIdAndUpdate(product._id, { $inc: { _stock: -quantity } });
        stockReservations.push({ productId: product._id.toString(), quantity });
      }

      // Step 3: Create order in pending state
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
      const orderId = `D${timestamp}${random}S`;

      // Calculate totals
      let subtotal = 0;
      let totalQuantity = 0;

      const orderItemsForDB = cartItems.map((item) => {
        const itemTotal = safeMultiply(item.price, item.quantity);
        subtotal = safeAdd(subtotal, itemTotal);
        totalQuantity += item.quantity;

        return {
          productId: new Types.ObjectId(item.productId),
          productTitle: item.productTitle,
          quantity: item.quantity,
          unitPrice: roundToTwo(item.price),
          totalPrice: itemTotal,
          digitalAssets: [],
        };
      });

      const totals = {
        subtotal: roundToTwo(subtotal),
        discount: 0,
        total: roundToTwo(subtotal),
      };

      // Set expiration to 2 minutes from now
      const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

      const order = await Order.create({
        orderId,
        buyerId: new Types.ObjectId(buyerId),
        sellerId: new Types.ObjectId((seller as SellerGroup['seller'])._id),
        items: orderItemsForDB,
        totals,
        status: 'pending', // Start in pending state
        paymentStatus: 'reserved', // Balance is reserved
        deliveryStatus: 'pending',
        expiresAt,
        metadata: {
          ipAddress,
          userAgent,
          totalQuantity,
        },
      });

      console.log('Order created in pending state:', order.orderId);

      // Step 4: Auto-confirm order immediately (simulating instant payment confirmation)
      // In a real system, this would happen via webhook or manual confirmation
      await confirmOrder((order._id as Types.ObjectId).toString());

      // Step 5: Create activity record for the order
      try {
        const productName =
          cartItems.length > 1
            ? `${cartItems[0].productTitle} และอีก ${cartItems.length - 1} รายการ`
            : cartItems[0].productTitle;

        const activityData = {
          type: 'purchase',
          category: 'financial',
          status: 'completed',
          metadata: {
            productName,
            quantity: totalQuantity,
            amount: formatPrice(totalAmount),
            sellerName: seller.store?.name || 'Store Name Error',
          },
          references: {
            order: order._id,
            seller: new Types.ObjectId((seller as SellerGroup['seller'])._id),
          },
          visibility: 'private',
          actors: {
            primary: {
              id: new Types.ObjectId(buyerId),
              type: 'buyer',
            },
            secondary: {
              id: new Types.ObjectId((seller as SellerGroup['seller'])._id),
              type: 'seller',
            },
          },
          completedAt: new Date(),
          priority: 'medium',
        };

        console.log('Creating purchase activity:', JSON.stringify(activityData, null, 2));
        const createdActivity = await Activity.create(activityData);
        console.log('Purchase activity created successfully:', createdActivity._id);
      } catch (activityError) {
        console.error('Failed to create activity record:', activityError);
        console.error('Activity error details:', JSON.stringify(activityError, null, 2));
        // Don't fail the order if activity creation fails
      }

      // Step 6: Send LINE notification to seller (async, don't wait)
      sendSellerNotification(seller, buyer, order, cartItems).catch(console.error);

      // Return success response
      return NextResponse.json({
        success: true,
        order: {
          orderId: order.orderId,
          status: 'completed',
          total: totalAmount,
          storeName: seller.store?.name || 'ไม่ระบุชื่อร้าน',
          items: cartItems.map((item) => ({
            productTitle: item.productTitle,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
          createdAt: order.createdAt,
        },
      });
    } catch (error) {
      console.error('Order creation failed:', error);

      // Comprehensive rollback
      try {
        // Restore stock reservations
        for (const { product, quantity } of orderItems as OrderItem[]) {
          await Product.findByIdAndUpdate(product._id, { $inc: { _stock: quantity } }).catch(
            console.error
          );
        }

        // Restore balance from reserved back to wallet
        const reservedBalance = await Balance.findOne({
          buyerId: new Types.ObjectId(buyerId),
          balanceType: 'reserved',
        });

        if (reservedBalance && reservedBalance.amount >= totalAmount) {
          await Balance.updateBalance(
            new Types.ObjectId(buyerId),
            'buyer',
            totalAmount,
            'reserved',
            'subtract'
          );

          await Balance.updateBalance(
            new Types.ObjectId(buyerId),
            'buyer',
            totalAmount,
            'wallet',
            'add'
          );
        }
      } catch (rollbackError) {
        console.error('Critical: Rollback failed:', rollbackError);
        // In production, this should trigger an alert for manual intervention
      }

      throw error;
    }
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

// Helper function to confirm order and complete the transaction
async function confirmOrder(orderId: string) {
  try {
    const order = await Order.findById(orderId).populate('items.productId');
    if (!order) {
      throw new Error('Order not found');
    }

    // Step 1: Move balance from reserved to seller's earnings
    const reservedBalance = await Balance.findOne({
      buyerId: order.buyerId,
      balanceType: 'reserved',
    });

    if (!reservedBalance || reservedBalance.amount < order.totals.total) {
      throw new Error('Insufficient reserved balance');
    }

    // Deduct from buyer's reserved balance
    await Balance.updateBalance(order.buyerId, 'buyer', order.totals.total, 'reserved', 'subtract');

    // Ensure seller has earnings balance and add to it
    await Balance.findOrCreateBalance(order.sellerId, 'seller', 'earnings');
    await Balance.updateBalance(order.sellerId, 'seller', order.totals.total, 'earnings', 'add');

    // Step 2: Create transaction record
    const transaction = await Transaction.createPurchaseTransaction(
      order.buyerId,
      order.sellerId,
      order.totals.total,
      order.orderId,
      {
        type: 'purchase',
        orderId: order._id,
        sellerId: order.sellerId,
      }
    );

    // Step 3: Allocate digital assets and remove from inventory
    for (const item of order.items) {
      const digitalInventory = await DigitalInventory.findOne({
        productId: item.productId,
        sellerId: order.sellerId,
      });

      if (digitalInventory && digitalInventory.digitalAssets.length > 0) {
        // Check if we have enough digital assets
        if (digitalInventory.digitalAssets.length < item.quantity) {
          throw new Error(`Insufficient digital assets for product: ${item.productTitle}`);
        }

        // Convert old format to new key-value format if needed
        const assetsToAllocate = digitalInventory.digitalAssets
          .slice(0, item.quantity)
          .map((asset: unknown) => {
            if (typeof asset === 'string') {
              // Old format: just a string
              return { key: 'Asset', value: asset };
            } else if (asset && typeof asset === 'object' && 'key' in asset && 'value' in asset) {
              // New format: already key-value
              return {
                key: (asset as { key: string; value: string }).key,
                value: (asset as { key: string; value: string }).value,
              };
            } else {
              // Unknown format: convert to string
              return { key: 'Data', value: JSON.stringify(asset) };
            }
          });

        // Update order with digital assets
        await Order.findOneAndUpdate(
          { _id: order._id, 'items.productId': item.productId },
          {
            $set: {
              'items.$.digitalAssets': assetsToAllocate,
            },
          }
        );

        // CRITICAL FIX: Remove allocated assets from digital inventory
        const remainingAssets = digitalInventory.digitalAssets.slice(item.quantity);

        await DigitalInventory.findByIdAndUpdate(digitalInventory._id, {
          $set: {
            digitalAssets: remainingAssets,
          },
        });

        // Update product stock to reflect remaining digital assets
        const newStockCount = remainingAssets.length;
        await Product.findByIdAndUpdate(item.productId, {
          $set: {
            _stock: newStockCount,
          },
        });

        console.log(`Digital assets allocated for ${item.productTitle}:`, {
          allocated: item.quantity,
          remaining: newStockCount,
          productId: item.productId.toString(),
        });
      }
    }

    // Step 4: Mark order as completed
    await Order.findByIdAndUpdate(order._id, {
      status: 'completed',
      paymentStatus: 'paid',
      deliveryStatus: 'delivered',
      confirmedAt: new Date(),
      completedAt: new Date(),
      transactionId: transaction._id,
    });

    // Step 5: Create pending reviews for the order
    try {
      await ReviewService.createPendingReviews(order);
      console.log('Pending reviews created for order:', order.orderId);
    } catch (reviewError) {
      console.error('Failed to create pending reviews:', reviewError);
      // Don't fail the order if review creation fails
    }

    console.log('Order confirmed and completed:', order.orderId);
  } catch (error) {
    console.error('Error confirming order:', error);
    throw error;
  }
}

// Helper function to send LINE notification to seller
async function sendSellerNotification(
  seller: SellerGroup['seller'],
  buyer: {
    name: string;
    username?: string;
    email: string;
  },
  order: { orderId: string },
  cartItems: CartItemForOrder[]
) {
  try {
    if (!seller.lineUserId) {
      console.log('Seller has no LINE contact configured');
      return;
    }

    const buyerName = buyer.name || buyer.username;
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cartItems.reduce(
      (sum, item) => safeAdd(sum, safeMultiply(item.price, item.quantity)),
      0
    );

    const productName =
      cartItems.length > 1
        ? `${cartItems[0].productTitle} และอีก ${cartItems.length - 1} รายการ`
        : cartItems[0].productTitle;

    const message = `🛒 คำสั่งซื้อใหม่!
👤 ลูกค้า: ${buyerName}
📦 สินค้า: ${productName}
🔢 จำนวน: ${totalQty} ชิ้น
💰 ยอดรวม: ${totalPrice.toLocaleString()} เหรียญ
📋 Order ID: ${order.orderId}`;

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v3/line/send-message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: seller.lineUserId,
        message,
      }),
    });

    if (!response.ok) {
      console.error('Failed to send LINE notification:', await response.text());
    }
  } catch (error) {
    console.error('Error sending LINE notification:', error);
  }
}
