import type { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

interface AuthResult {
  success: boolean;
  message?: string;
  userId?: string;
}

export async function verifyAuth(request: NextRequest): Promise<AuthResult> {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, message: 'Authorization header missing or invalid' };
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return { success: false, message: 'Token not provided' };
    }

    // Verify the token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'fallback_secret_not_for_production'
    ) as { id: string };

    if (!decoded || !decoded.id) {
      return { success: false, message: 'Invalid token' };
    }

    return { success: true, userId: decoded.id };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return { success: false, message: 'Invalid token' };
    } else if (error instanceof jwt.TokenExpiredError) {
      return { success: false, message: 'Token expired' };
    } else {
      // console.error('Auth verification error:', error);
      return { success: false, message: 'Authentication error' };
    }
  }
}
