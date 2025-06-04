/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Metadata } from 'next';
import { put } from '@vercel/blob';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import DCSymbolWhite from '@/assets/icons/DCSymbolWhite.svg';
import DCSymbolBlack from '@/assets/icons/DCSymbolBlack.svg';
import noImageWhite from '@/assets/images/placeholder/no-image-white.webp';
import noImageBlack from '@/assets/images/placeholder/no-image-black.webp';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const generateMetadata = ({
  title,
  description,
  url,
  image,
  keywords,
  manifest,
  iconUrl,
}: {
  title: string;
  description?: string;
  url?: string;
  image?: string;
  keywords?: string;
  manifest?: string;
  iconUrl?: string;
}): Metadata => {
  const defaultKeywords =
    'Netflix Premium, บัญชี Netflix, บริการสตรีมมิ่ง, ดูหนังออนไลน์, ดูซีรีส์, บัญชีราคาถูก, Dokmai Store, ซื้อ Netflix ราคาถูก, บัญชี Netflix ราคาถูก, บัญชี Netflix คุณภาพดี, บริการลูกค้าไว, Netflix Premium, Netflix, Premium, Netflix Account, Account, Netflix Access, Dokmai, Store, Dokmai Store, Digital Product, Premium App, Streaming Service, Service, Streaming, Movie, Movies, Series, Action, Comedy, Drama, Romantic, Watching, Netflix Series, Netflix Movie, Cheap, Cheap Price, High Quality, Good Quality, Quality, amazon prime video, prime video, Fast Service, Fast Response, Trustable, Reliable, Affordable, เน็ตฟลิกซ์พรีเมียม, เน็ตฟลิกซ์, พรีเมียม, บัญชีเน็ตฟลิกซ์, บัญชี, แอคเค้าท์เน็ตฟลิกซ์,  แอคเค้าท์, เน็ตฟลิกซ์ Access, ดอกไม้สโตร์, ดอกไม้, สโตร์, ร้านค้า, สินค้าดิจิทัล, สินค้าดิจิตอล, แอพพรีเมียม, บริการสตรีมมื่ง, บริการ, สตรีมมิ่ง, หนัง, ดูหนัง, ซีรีย์, ดูซีรีย์, ดู, ซีรีย์เน็ตฟลิกซ์, ซีรีย์ Netflix, Series เน็ตฟลิกซ์, หนังเน็ตฟลิกซ์, หนัง Netflix, ราคาถูก, ราคาดี, ถูก, คุณภาพดี, คุณภาพสูง, คุณภาพ, บริการเร็ว, บริการไว, บริการดี, ตอบเร็ว, ตอบไว, น่าเชื่อถือ, เชื่อถือได้';
  const defaultTitle = 'แอพพรีเมียมคุณภาพสูง | Dokmai Store';
  const defaultDescription =
    'แพลตฟอร์มสินค้าดิจิทัลที่ดีที่สุดในประเทศไทย สำหรับทุกคนที่ต้องการบัญชีแอพพรีเมียมในราคาถูกและคุณภาพดี ไม่ว่าจะเป็น Netflix Premium, Amazon Prime Video หรือบริการอื่น ๆ ที่ Dokmai Store เราเป็นผู้ขายอันดับหนึ่งในไทย พร้อมการันตีคุณภาพการใช้งานตลอดอายุการใช้งาน ด้วยบริการที่เชื่อถือได้ ตอบกลับลูกค้าอย่างรวดเร็วภายใน 10 นาที และไม่เกิน 24 ชั่วโมง พร้อมช่วยแก้ไขปัญหาทุกอย่างเพื่อให้คุณได้รับประสบการณ์การใช้งานที่ดีที่สุด';
  const defaultImage = 'https://dokmaistore.com/images/og-dokmaistore.webp';
  const defaultUrl = 'https://dokmaistore.com';
  return {
    title: title ? `${title}` : defaultTitle,
    description: description || defaultDescription,
    icons: {
      icon: [
        {
          url: iconUrl ? iconUrl : '/icons/favicon.png',
          sizes: '192x192',
        },
        {
          url: iconUrl ? iconUrl : '/favicon.png',
          sizes: '512x512',
        },
      ],
    },
    manifest: manifest ? `${manifest}` : '/manifest.json',
    keywords: `${keywords} ${defaultKeywords}`,
    openGraph: {
      type: 'website',
      url: url || defaultUrl,
      title: title ? `${title} | Dokmai Store` : defaultTitle,
      description: description || defaultDescription,
      images: [
        {
          url: image || defaultImage,
          width: 1200,
          height: 630,
          alt: 'Netflix Premium คุณภาพสูง ราคาถูก ที่ Dokmai Store',
        },
      ],
      siteName: 'Dokmai Store',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@DokmaiStore',
      title: title ? `${title} | Dokmai Store` : defaultTitle,
      description: description || defaultDescription,
      images: [
        {
          url: image || defaultImage,
          alt: 'Netflix Premium คุณภาพสูง ราคาถูก ที่ Dokmai Store',
        },
      ],
    },
    alternates: {
      canonical: url || defaultUrl,
    },
  };
};

export const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();

  const seconds = Math.floor(diffInMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) {
    return years === 1 ? '1 year ago' : `${years} years ago`;
  } else if (months > 0) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  } else if (weeks > 0) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else if (days > 0) {
    return days === 1 ? '1 day ago' : `${days} days ago`;
  } else if (hours > 0) {
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  } else if (minutes > 0) {
    return minutes === 1 ? '1 minute ago' : `${minutes} minutes ago`;
  } else {
    return seconds <= 1 ? 'just now' : `${seconds} seconds ago`;
  }
};

export const convertGoogleDriveUrl = (shareableUrl: string): string => {
  if (!shareableUrl || shareableUrl === '') {
    throw new Error('Link is Empty');
  }
  const fileIdMatch = shareableUrl.match(/(?:\/d\/|id=)([a-zA-Z0-9_-]{25,})/);
  if (fileIdMatch && fileIdMatch[1]) {
    const fileId = fileIdMatch[1];
    return `https://drive.usercontent.google.com/download?id=${fileId}&authuser=0`;
  } else {
    throw new Error('Invalid Google Drive URL format');
  }
};

export async function logActivity(type: string, user: string, details: any) {
  const logEntry = { type, user, details };
  const response = await fetch('/api/v2/log_activity', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.NEXT_PUBLIC_LOGGING_API_KEY || '',
    },
    body: JSON.stringify({ logEntry }),
  });

  if (!response.ok) {
    // console.error('Failed to log activity');
  }
}

export const updateStatistic = async (
  type: 'depositAmount' | 'spentAmount' | 'productsSold' | 'userLogins',
  value: number
) => {
  const time = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  }).format(new Date());

  const date = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Bangkok',
  }).format(new Date());

  const payload: Record<string, any> = { time, date, [type]: value };

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v2/update_statistic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      // const errorData = await response.json();
      // console.error(`Failed to update ${type}:`, errorData);
    }
  } catch (error) {
    // console.error(`Error updating ${type}:`, error);
  }
};

export const formatTime = (timestamp: string | null) => {
  if (!timestamp) return 'No activity';
  try {
    return new Date(timestamp)
      .toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(' at ', ', ');
  } catch {
    return 'N/A';
  }
};

export const getAdminToken = () => {
  const authDataString = localStorage.getItem('auth');
  if (!authDataString) {
    return null;
  }
  try {
    const authData = JSON.parse(authDataString);
    return authData.token || null;
  } catch (error) {
    // console.error('Error parsing authData:', error);
    return null;
  }
};

export async function uploadImage(file: File): Promise<string> {
  const { url } = await put(`images/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  });
  return url;
}

export function generatePersonalKey(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  // Ensure at least one uppercase, one lowercase, and one number
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'dokmaistre';
  const numbers = '0123456789';

  // Add one character from each category
  result += uppercase.charAt(Math.floor(Math.random() * uppercase.length));
  result += lowercase.charAt(Math.floor(Math.random() * lowercase.length));
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Fill the remaining 7 characters randomly
  for (let i = 3; i < 10; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle the result to randomize the position of guaranteed characters
  return result
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
}

interface BuyerAuthResult {
  success: boolean;
  message?: string;
  userId?: string;
}

export async function verifyBuyerAuth(request: NextRequest): Promise<BuyerAuthResult> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, message: 'Authorization header missing or invalid' };
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return { success: false, message: 'Token not provided' };
    }

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

export const getSubdomain = (hostname: string): string | null => {
  let domain = hostname;

  if (hostname.includes(':')) {
    domain = hostname.split(':')[0];
  }

  if (domain.endsWith('.localhost')) {
    const parts = domain.split('.');
    if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
      return parts[0];
    }
  } else if (domain.endsWith('.dokmai.store')) {
    const parts = domain.split('.');
    if (parts.length >= 3 && parts.slice(-2).join('.') === 'dokmai.store') {
      return parts[0];
    }
  } else if (domain.includes('vercel.app')) {
    const parts = domain.split('.');
    return parts[0];
  }
  return null;
};

export async function sendLineMessage(
  userId: any,
  message: any,
  endpoint = '/api/v3/line/send-message'
) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid or missing userId');
  }
  if (!message || typeof message !== 'string') {
    throw new Error('Invalid or missing message');
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, message }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send message');
    }

    return await response.json();
  } catch (error) {
    // console.error('Error in sendLineMessage:', error);
    throw error; // Let the caller handle the error
  }
}

export const dokmaiCoinSymbol = (isLight: boolean) => {
  return isLight ? DCSymbolBlack : DCSymbolWhite;
};
export const dokmaiImagePlaceholder = (isLight: boolean) => {
  return isLight ? noImageWhite : noImageBlack;
};
