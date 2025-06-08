import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import {
  LineService,
  type LineWebhookBody,
  type LineWebhookEvent,
} from '@/lib/services/lineService';

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      console.error('Missing LINE signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    if (!LineService.verifySignature(body, signature)) {
      console.error('Invalid LINE signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const webhookBody: LineWebhookBody = JSON.parse(body);

    await connectToDatabase();

    // Process each event
    for (const event of webhookBody.events) {
      await processLineEvent(event);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('LINE webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processLineEvent(event: LineWebhookEvent) {
  const { type, source, replyToken } = event;

  // Handle follow events (when user adds bot as friend)
  if (type === 'follow') {
    await LineService.sendReplyMessage(replyToken, LineService.getWelcomeMessage());
    return;
  }

  // Only process text messages from users
  if (
    type !== 'message' ||
    !event.message ||
    event.message.type !== 'text' ||
    source.type !== 'user'
  ) {
    return;
  }

  const userId = source.userId;
  const messageText = event.message.text.trim();
  console.log(`Received message from user ${userId}: ${messageText}`);
  try {
    // Extract verification code from message
    const verificationCode = LineService.extractVerificationCode(messageText);

    if (!verificationCode) {
      // If no verification code found, send help message
      await LineService.sendReplyMessage(
        replyToken,
        'กรุณาส่งรหัสยืนยันในรูปแบบ DOK123456 ที่คุณได้รับจากหน้าลงทะเบียนครับ'
      );
      return;
    }

    // Find seller with matching verification code
    const seller = await Seller.findOne({
      'verification.code': verificationCode,
      'verification.status': 'pending',
    });

    if (!seller) {
      await LineService.sendReplyMessage(replyToken, LineService.getInvalidCodeMessage());
      return;
    }

    // Check if verification code is expired
    if (LineService.isCodeExpired(seller.verification!.expiresAt)) {
      // Update status to expired
      seller.verification!.status = 'expired';
      await seller.save();

      await LineService.sendReplyMessage(replyToken, LineService.getInvalidCodeMessage());
      return;
    }

    // Check if this LINE user is already linked to another seller
    const existingSeller = await Seller.findOne({
      lineUserId: userId,
      _id: { $ne: seller._id },
    });

    if (existingSeller) {
      await LineService.sendReplyMessage(
        replyToken,
        '❌ บัญชีไลน์นี้ถูกใช้งานแล้วกับร้านค้าอื่น\n\nหนึ่งบัญชีไลน์สามารถลงทะเบียนได้เพียงหนึ่งร้านเท่านั้น'
      );
      return;
    }

    // Verification successful - update seller
    seller.lineUserId = userId;
    seller.verification!.status = 'verified';
    seller.verification!.verifiedAt = new Date();
    await seller.save();

    // Send success message
    const successMessage = LineService.getVerificationSuccessMessage(seller.store.name);
    await LineService.sendReplyMessage(replyToken, successMessage);

    console.log(`Seller verification successful: ${seller.username} (${seller.store.name})`);
  } catch (error) {
    console.error('Error processing LINE event:', error);

    // Send generic error message to user
    try {
      await LineService.sendReplyMessage(
        replyToken,
        'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งหรือติดต่อทีมงาน'
      );
    } catch (replyError) {
      console.error('Error sending error reply:', replyError);
    }
  }
}
