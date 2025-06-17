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

export const consoleFuck = `             ███░░░░░░░░░░███             
          █░░░░░░░░░░░░░░░░░░░░█          
       █▒░░░░░░░░░░░░░░░░░░░░░░░░▒█       
     █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█     
    █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█    
  █░░░░░███████░░░░░░░░░░░░███████░░░░░█  
 █░░░░░░░█████████░░░░░░█████████░░░░░░░█ 
 ▓░░░░░░░▓██████████░░██████████▓░░░░░░░▓ 
█░░░░░░░░░██████████████████████░░░░░░░░░█
▓░░░░░░░░▓██████████████████████▓░░░░░░░░▒
▒░░░░████████████████████████████████░░░░░
░░░████████████████████████████████████░░░
▒░░░░████████████████████████████████░░░░░
▓░░░░░░░░▓██████████████████████▓░░░░░░░░▒
█░░░░░░░░░██████████████████████░░░░░░░░░█
 ▓░░░░░░░▓██████████░░██████████▓░░░░░░░▓ 
 █░░░░░░░█████████░░░░░░█████████░░░░░░░█ 
  █░░░░░███████▒░░░░░░░░░░▒███████░░░░░█  
    █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█    
     █░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░█     
       █▒░░░░░░░░░░░░░░░░░░░░░░░░▒█       
          █░░░░░░░░░░░░░░░░░░░░█          
             ██▓░░░░░░░░░░▓██             `;

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
    'Digital Marketplace, Online Marketplace, E-commerce Platform, Digital Products, Sell Online, Buy Online, Multi-vendor Marketplace, Digital Store, Online Store Builder, E-commerce Solution, Marketplace Platform, Digital Commerce, Online Business, Seller Platform, Buyer Platform, Professional Marketplace, Thailand Marketplace, Thai E-commerce, Unlimited Customization, Professional Subdomains, Fast Performance, Clean Interface, Reliable Service, Quality Platform, Professional Grade, Lightning Fast, Clean Design, Easy Setup, Thai Support, Secure Marketplace, Modern Interface, Mobile Optimized, Quality Service, Expert Support, ตลาดออนไลน์, แพลตฟอร์มขายของออนไลน์, ร้านค้าออนไลน์, ขายของออนไลน์, ซื้อของออนไลน์, ตลาดดิจิทัล, สินค้าดิจิทัล, แพลตฟอร์มอีคอมเมิร์ซ, ระบบขายของออนไลน์, เว็บขายของ, สร้างร้านค้าออนไลน์, ตลาดออนไลน์ไทย, อีคอมเมิร์ซไทย, ปรับแต่งได้ไม่จำกัด, โดเมนย่อยมืออาชีพ, ประสิทธิภาพสูง, อินเทอร์เฟซสะอาด, บริการเชื่อถือได้, แพลตฟอร์มคุณภาพ, มืออาชีพ, เร็วสุด, ดีไซน์สะอาด, ฟีเจอร์ไม่จำกัด, ตั้งค่าง่าย, ซัพพอร์ตไทย, แพลตฟอร์มเชื่อถือได้, ตลาดปลอดภัย, บริการคุณภาพ, ซัพพอร์ตผู้เชี่ยวชาญ, ดอกไม้สโตร์, Dokmai Store';
  const defaultTitle = 'แพลตฟอร์มตลาดออนไลน์มืออาชีพ | Dokmai Store';
  const defaultDescription =
    'แพลตฟอร์มตลาดดิจิทัลแบบมืออาชีพที่ดีที่สุดในไทย เว็บไซต์ดูสะอาดตา ประสิทธิภาพสูง การปรับแต่งร้านได้ไม่จำกัด สร้างร้านค้าของคุณได้ในไม่กี่นาที พร้อมระบบจัดการครบครัน บริการเชื่อถือได้ ระบบปลอดภัย เหมาะสำหรับผู้ขายและผู้ซื้อที่ต้องการประสบการณ์การซื้อขายออนไลน์ระดับมืออาชีพ';
  const defaultImage = 'https://dokmaistore.com/icons/favicon.png';
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
          alt: 'แพลตฟอร์มตลาดออนไลน์มืออาชีพ Dokmai Store',
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
          alt: 'แพลตฟอร์มตลาดออนไลน์มืออาชีพ Dokmai Store',
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

// Precision utility functions for monetary calculations
export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

export const safeAdd = (...numbers: number[]): number => {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return roundToTwo(sum);
};

export const safeSubtract = (a: number, b: number): number => {
  return roundToTwo(a - b);
};

export const safeMultiply = (a: number, b: number): number => {
  return roundToTwo(a * b);
};

export const safeDivide = (a: number, b: number): number => {
  if (b === 0) throw new Error('Division by zero');
  return roundToTwo(a / b);
};

export const formatPrice = (price: number): string => {
  const rounded = roundToTwo(price);
  return rounded.toFixed(2);
};

export const formatPriceDisplay = (price: number): string => {
  const rounded = roundToTwo(price);
  return rounded.toString();
};
