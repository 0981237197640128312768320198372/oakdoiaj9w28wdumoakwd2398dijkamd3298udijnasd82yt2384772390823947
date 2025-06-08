/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { PendingRegistration } from '@/models/v3/PendingRegistration';
import { LineService } from '@/lib/services/lineService';
import { broadcastVerificationComplete } from '@/lib/services/sseService';

const channelSecret = process.env.LINE_CHANNEL_SECRET || 'asd';

// Rate limiting map to prevent spam (userId -> last attempt timestamp)
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_WINDOW = 30 * 1000; // 30 seconds
const MAX_ATTEMPTS_PER_WINDOW = 3;

// Attempt tracking map (userId -> attempt count)
const attemptTracker = new Map<string, number>();

async function handleEvent(event: any) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const messageText = event.message.text;
    const replyToken = event.replyToken;

    console.log(`User ID received: ${userId}`);
    console.log(`Message received: ${messageText}`);

    try {
      await connectToDatabase();

      // Quick exit: Check if any pending registrations exist before processing
      const hasPendingRegistrations = await PendingRegistration.countDocuments({
        'verification.expiresAt': { $gt: new Date() },
      });

      if (hasPendingRegistrations === 0) {
        console.log('No active pending registrations found. Ignoring message.');
        return;
      }

      // Extract verification code from message
      const verificationCode = LineService.extractVerificationCode(messageText);

      if (verificationCode) {
        console.log(`Verification code found: ${verificationCode}`);

        // Rate limiting check
        const now = Date.now();
        const lastAttempt = rateLimitMap.get(userId) || 0;
        const attempts = attemptTracker.get(userId) || 0;

        if (now - lastAttempt < RATE_LIMIT_WINDOW && attempts >= MAX_ATTEMPTS_PER_WINDOW) {
          console.log(`Rate limit exceeded for user ${userId}`);
          await LineService.sendReplyMessage(
            replyToken,
            'คุณส่งรหัสยืนยันบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง'
          );
          return;
        }

        // Update rate limiting counters
        if (now - lastAttempt >= RATE_LIMIT_WINDOW) {
          attemptTracker.set(userId, 1);
        } else {
          attemptTracker.set(userId, attempts + 1);
        }
        rateLimitMap.set(userId, now);

        // Check if this LINE User ID has already been used for verification
        const existingVerifiedSeller = await Seller.findOne({ lineUserId: userId });
        if (existingVerifiedSeller) {
          console.log(
            `LINE User ID ${userId} already used for verification by seller: ${existingVerifiedSeller.username}`
          );
          await LineService.sendReplyMessage(
            replyToken,
            `This LINE account has already been used to verify the store "${existingVerifiedSeller.store.name}". Each LINE account can only be used once for verification.`
          );
          return;
        }

        // Check if this LINE User ID is already being used in another pending registration
        const existingPendingWithLineUser = await PendingRegistration.findOne({
          lineUserId: userId,
        });
        if (existingPendingWithLineUser) {
          console.log(
            `LINE User ID ${userId} already being used in pending registration: ${existingPendingWithLineUser.username}`
          );
          await LineService.sendReplyMessage(
            replyToken,
            'This LINE account is already being used for another registration process. Please complete that registration first or contact support.'
          );
          return;
        }

        // Find pending registration with this verification code
        const pendingRegistration = await PendingRegistration.findOne({
          'verification.code': verificationCode,
        });

        if (pendingRegistration) {
          // Check if code is expired
          if (LineService.isCodeExpired(pendingRegistration.verification.expiresAt)) {
            await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
            await LineService.sendReplyMessage(replyToken, LineService.getInvalidCodeMessage());
            return;
          }

          // Update pending registration with LINE User ID to claim it
          await PendingRegistration.updateOne(
            { _id: pendingRegistration._id },
            { lineUserId: userId }
          );

          const newSeller = new Seller({
            username: pendingRegistration.username,
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            contact: pendingRegistration.contact,
            store: {
              ...pendingRegistration.store,
              theme: null, // Ensure theme is null to avoid BSON error
            },
            lineUserId: userId,
            verification: {
              code: pendingRegistration.verification.code,
              status: 'verified',
              expiresAt: pendingRegistration.verification.expiresAt,
              verifiedAt: new Date(),
            },
            isActive: true,
          });

          await newSeller.save();

          // Store pendingId before deletion
          const pendingId = pendingRegistration._id.toString();

          // Clean up pending registration
          await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

          console.log(`Seller account created for ${newSeller.username} after LINE verification`);

          // Broadcast verification completion to waiting SSE clients
          console.log(`Broadcasting verification complete for pendingId: ${pendingId}`);
          broadcastVerificationComplete(pendingId, {
            _id: newSeller._id.toString(),
            store: { name: newSeller.store.name },
            username: newSeller.username,
          });

          // Clear rate limiting data for successful verification
          rateLimitMap.delete(userId);
          attemptTracker.delete(userId);

          // Send success message
          await LineService.sendReplyMessage(
            replyToken,
            LineService.getVerificationSuccessMessage(newSeller.store.name)
          );
        } else {
          // Check if this code belongs to an already verified seller
          const existingSeller = await Seller.findOne({
            'verification.code': verificationCode,
            'verification.status': 'verified',
          });

          if (existingSeller) {
            await LineService.sendReplyMessage(
              replyToken,
              LineService.getAlreadyVerifiedMessage(existingSeller.store.name)
            );
          } else {
            // Invalid or expired verification code
            await LineService.sendReplyMessage(replyToken, LineService.getInvalidCodeMessage());
          }
        }
      } else {
        // No verification code found - don't reply (ignore the message)
        return;
      }
    } catch (error) {
      console.error('Error handling LINE message:', error);

      // Send generic error message
      await LineService.sendReplyMessage(
        replyToken,
        'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งหรือติดต่อทีมสนับสนุน'
      );
    }
  }

  // Handle follow event (when user adds bot as friend)
  if (event.type === 'follow') {
    const userId = event.source.userId;
    const replyToken = event.replyToken;

    console.log(`New follower: ${userId}`);

    try {
      await LineService.sendReplyMessage(replyToken, LineService.getWelcomeMessage());
    } catch (error) {
      console.error('Error sending welcome message:', error);
    }
  }
}

export async function POST(req: any) {
  try {
    const bodyText = await req.text();
    const signature = req.headers.get('x-line-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const bodyBuffer = Buffer.from(bodyText, 'utf-8');

    const computedSignature = crypto
      .createHmac('sha256', channelSecret)
      .update(bodyBuffer)
      .digest('base64');

    if (computedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const body = JSON.parse(bodyText);

    await Promise.all(body.events.map(handleEvent));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('LINE webhook error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
