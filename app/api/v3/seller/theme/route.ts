import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';

interface ThemeData {
  primaryColor?: string;
  secondaryColor?: string;
  fontFamily?: string;
}

interface SellerData {
  store?: ThemeData;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const subdomain = searchParams.get('subdomain');

  if (!subdomain) {
    return NextResponse.json({ error: 'Subdomain is required' }, { status: 400 });
  }

  try {
    await connectToDatabase();

    const seller = (await Seller.findOne({ username: subdomain }).lean()) as SellerData | null;

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const themeData = {
      primaryColor: '#B9FE13',
      secondaryColor: '#5E5E5E',
      fontFamily: 'AktivGroteskRegular',
      ...(seller.store || {}),
    };

    return NextResponse.json(themeData);
  } catch (error) {
    console.error('Error fetching seller theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
