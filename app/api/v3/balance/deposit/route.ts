import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { BalanceService } from '@/lib/services/balanceService';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-09-30.acacia',
});

// Helper function to generate a QR code for PromptPay
const generateQRCodeData = async (amount: number, email: string): Promise<string> => {
  // This is a placeholder - in a real implementation, you would generate a proper QR code
  // For now, we'll return a dummy string that represents QR code data
  return `promptpay://payment?amount=${amount}&email=${encodeURIComponent(
    email
  )}&ref=${Date.now()}`;
};

export async function POST(request: Request) {
  try {
    // Get the authenticated user
    const headersList = await headers();
    const authHeader = headersList.get('authorization');

    // Create a NextRequest-like object with the authorization header
    const mockRequest = {
      headers: {
        get: (name: string) => (name === 'authorization' ? authHeader : null),
      },
    } as unknown as NextRequest;

    // Verify authentication
    const auth = await verifyAuth(mockRequest);

    if (!auth.success || !auth.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const requestData = await request.json();
    const { amount, returnUrl, email, paymentMethod = 'card' } = requestData;

    // Validate the amount
    if (!amount || isNaN(Number(amount)) || Number(amount) < 10) {
      return NextResponse.json(
        { error: 'Invalid amount. Minimum deposit is 10 THB.' },
        { status: 400 }
      );
    }

    const amountInTHB = Number(amount);

    let checkoutSession;
    let paymentIntentId = '';
    let qrCodeData = '';

    if (paymentMethod === 'promptpay') {
      // Create a payment intent for PromptPay
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amountInTHB * 100), // Convert to cents
        currency: 'thb',
        payment_method_types: ['promptpay'],
        metadata: {
          userId: auth.userId,
          userType: 'buyer',
          amount: amountInTHB.toString(),
          dokmaiCoins: amountInTHB.toString(),
        },
      });

      paymentIntentId = paymentIntent.id;

      // Generate QR code data for PromptPay
      qrCodeData = await generateQRCodeData(amountInTHB, email || '');
    } else {
      // Create a Stripe Checkout Session for card payments
      checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'thb',
              product_data: {
                name: 'Dokmai Coin Deposit',
                description: `${amountInTHB} Dokmai Coins (1 Dokmai Coin = 1 THB)`,
                images: ['https://dokmaistore.com/icons/favicon.png'],
              },
              unit_amount: amountInTHB * 100, // Stripe uses cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url:
          returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/buyer/dashboard?deposit=success`,
        cancel_url:
          returnUrl || `${process.env.NEXT_PUBLIC_BASE_URL}/buyer/dashboard?deposit=cancelled`,
        metadata: {
          userId: auth.userId,
          userType: 'buyer',
          amount: amountInTHB.toString(),
          dokmaiCoins: amountInTHB.toString(),
        },
      });

      paymentIntentId = checkoutSession.payment_intent as string;
    }

    // Create a pending transaction in our system
    const { transaction } = await BalanceService.initiateDeposit(
      auth.userId,
      amountInTHB,
      'stripe',
      paymentIntentId,
      {
        checkoutSessionId: checkoutSession?.id || '',
        paymentIntentId: paymentIntentId,
      }
    );

    // Return the appropriate response based on payment method
    if (paymentMethod === 'promptpay') {
      return NextResponse.json({
        paymentIntentId,
        qrCodeData,
        amount: amountInTHB,
        transactionId: transaction.transactionId,
      });
    } else {
      return NextResponse.json({
        checkoutUrl: checkoutSession?.url,
        transactionId: transaction.transactionId,
      });
    }
  } catch (error) {
    console.error('Error initiating deposit:', error);
    return NextResponse.json({ error: 'Failed to initiate deposit' }, { status: 500 });
  }
}
