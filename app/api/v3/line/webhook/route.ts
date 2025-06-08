/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { PendingRegistration } from '@/models/v3/PendingRegistration';
import { LineService } from '@/lib/services/lineService';
import { broadcastVerificationComplete } from '@/lib/services/sseService';

const channelSecret = process.env.LINE_CHANNEL_SECRET || 'asd';

async function handleEvent(event: any) {
  if (event.type === 'message' && event.message.type === 'text') {
    const userId = event.source.userId;
    const messageText = event.message.text;
    const replyToken = event.replyToken;

    try {
      const codeVerif = messageText.includes('DS-') || messageText;
      await connectToDatabase();

      const verificationCode = LineService.extractVerificationCode(codeVerif);

      if (verificationCode) {
        console.log(`Verification code found: ${verificationCode}`);

        const pendingRegistration = await PendingRegistration.findOne({
          'verification.code': verificationCode,
        });

        if (pendingRegistration) {
          if (LineService.isCodeExpired(pendingRegistration.verification.expiresAt)) {
            await PendingRegistration.deleteOne({ _id: pendingRegistration._id });
            await LineService.sendReplyMessage(replyToken, LineService.getInvalidCodeMessage());
            return;
          }

          const newSeller = new Seller({
            username: pendingRegistration.username,
            email: pendingRegistration.email,
            password: pendingRegistration.password,
            contact: pendingRegistration.contact,
            store: {
              ...pendingRegistration.store,
              theme: null,
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

          const pendingId = pendingRegistration._id.toString();

          await PendingRegistration.deleteOne({ _id: pendingRegistration._id });

          console.log(`Seller account created for ${newSeller.username} after LINE verification`);

          console.log(`Broadcasting verification complete for pendingId: ${pendingId}`);
          broadcastVerificationComplete(pendingId, {
            _id: newSeller._id.toString(),
            store: { name: newSeller.store.name },
            username: newSeller.username,
          });

          await LineService.sendReplyMessage(
            replyToken,
            LineService.getVerificationSuccessMessage(newSeller.store.name)
          );
        } else {
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
        return;
      }
    } catch (error) {
      console.error('Error handling LINE message:', error);

      await LineService.sendReplyMessage(
        replyToken,
        'เกิดข้อผิดพลาดในระบบ กรุณาลองใหม่อีกครั้งหรือติดต่อทีมสนับสนุน'
      );
    }
  }

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
