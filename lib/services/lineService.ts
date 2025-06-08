import crypto from 'crypto';

export interface LineVerificationCode {
  code: string;
  expiresAt: Date;
}

export interface LineWebhookEvent {
  type: string;
  source: {
    type: string;
    userId: string;
  };
  message?: {
    type: string;
    text: string;
  };
  timestamp: number;
  replyToken: string;
}

export interface LineWebhookBody {
  events: LineWebhookEvent[];
  destination: string;
}

export const OWNER_ID = process.env.LINE_OWNER_ID || '';

export class LineService {
  private static readonly CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  private static readonly CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET;
  private static readonly LINE_API_BASE = 'https://api.line.me/v2/bot';

  /**
   * Generate a unique verification code
   */
  static generateVerificationCode(): LineVerificationCode {
    const code = 'DOK' + crypto.randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    return { code, expiresAt };
  }

  /**
   * Verify LINE webhook signature
   */
  static verifySignature(body: string, signature: string): boolean {
    if (!this.CHANNEL_SECRET) {
      console.error('LINE_CHANNEL_SECRET not configured');
      return false;
    }

    const hash = crypto.createHmac('sha256', this.CHANNEL_SECRET).update(body).digest('base64');

    return hash === signature;
  }

  /**
   * Send reply message to LINE user
   */
  static async sendReplyMessage(replyToken: string, message: string): Promise<boolean> {
    if (!this.CHANNEL_ACCESS_TOKEN) {
      console.error('LINE_CHANNEL_ACCESS_TOKEN not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.LINE_API_BASE}/message/reply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          replyToken,
          messages: [
            {
              type: 'text',
              text: message,
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send LINE reply message:', error);
      return false;
    }
  }

  /**
   * Send push message to LINE user
   */
  static async sendPushMessage(userId: string, message: string): Promise<boolean> {
    if (!this.CHANNEL_ACCESS_TOKEN) {
      console.error('LINE_CHANNEL_ACCESS_TOKEN not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.LINE_API_BASE}/message/push`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.CHANNEL_ACCESS_TOKEN}`,
        },
        body: JSON.stringify({
          to: userId,
          messages: [
            {
              type: 'text',
              text: message,
            },
          ],
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to send LINE push message:', error);
      return false;
    }
  }

  /**
   * Extract verification code from message text
   */
  static extractVerificationCode(text: string): string | null {
    if (!text || typeof text !== 'string') {
      return null;
    }

    // Match DOK followed by 6 digits (case insensitive)
    const match = text.match(/DOK\d{6}/i);
    return match ? match[0].toUpperCase() : null;
  }

  /**
   * Check if verification code is expired
   */
  static isCodeExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Generate success message for verified seller
   */
  static getVerificationSuccessMessage(storeName: string): string {
    return `🎉 ยินดีด้วย! การยืนยันตัวตนสำเร็จแล้ว\n\nร้าน: ${storeName}\nสถานะ: ✅ ยืนยันแล้ว\n\nขอบคุณที่เข้าร่วมกับเรา! คุณจะได้รับการแจ้งเตือนเกี่ยวกับคำสั่งซื้อและข้อมูลสำคัญผ่านไลน์นี้`;
  }

  /**
   * Generate error message for invalid code
   */
  static getInvalidCodeMessage(): string {
    return `❌ รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว\n\nกรุณาตรวจสอบรหัสยืนยันและลองใหม่อีกครั้ง หรือสร้างรหัสใหม่จากหน้าลงทะเบียน`;
  }

  /**
   * Generate welcome message
   */
  static getWelcomeMessage(): string {
    return `สวัสดีครับ! 👋\n\nขอบคุณที่เพิ่มเราเป็นเพื่อน\nหากคุณกำลังลงทะเบียนเป็นผู้ขาย กรุณาส่งรหัสยืนยันที่ได้รับจากหน้าลงทะเบียนมาให้เราครับ\n\nรูปแบบรหัส: DOK123456\n\n💡 เคล็ดลับ: คัดลอกรหัสจากหน้าลงทะเบียนแล้วส่งมาที่นี่เลย!`;
  }

  /**
   * Generate help message for existing users
   */
  static getHelpMessage(storeName: string): string {
    return `สวัสดีครับ คุณ ${storeName}! 👋\n\nคุณได้ยืนยันตัวตนเรียบร้อยแล้ว ✅\n\nหากต้องการความช่วยเหลือ กรุณาติดต่อทีมสนับสนุนของเรา\n\n📞 สอบถามเพิ่มเติม: support@dokmai.store`;
  }

  /**
   * Generate already verified message
   */
  static getAlreadyVerifiedMessage(storeName: string): string {
    return `สวัสดีครับ คุณ ${storeName}! 👋\n\nบัญชีของคุณได้รับการยืนยันแล้ว ✅\n\nคุณสามารถเข้าสู่ระบบและจัดการร้านค้าของคุณได้แล้ว`;
  }
}

/**
 * Send notification message to LINE user (alias for backward compatibility)
 */
export async function notifyLineMessage(userId: string, message: string): Promise<boolean> {
  return LineService.sendPushMessage(userId, message);
}
