/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';

interface ThemeData {
  roundedness: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  fontFamily: string;
  backgroundImage: string;
  buttonTextColor: string;
  buttonBgColor: string;
  buttonBorder: string;
  spacing: string;
  shadow: string;
  adsImageUrl: string;
}

interface SellerData {
  store?: any;
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
      primaryColor: seller?.store?.theme.primaryColor || '#B9FE13',
      secondaryColor: seller?.store?.theme.secondaryColor || '#5E5E5E',
      fontFamily: seller?.store?.theme.fontFamily || 'AktivGroteskRegular',
      roundedness: seller?.store?.theme.roundedness || 'default',
      textColor: seller?.store?.theme.textColor || '#ECECEC',
      backgroundImage: seller?.store?.theme.backgroundImage || null,
      buttonTextColor: seller?.store?.theme.buttonTextColor || '#0F0F0F',
      buttonBgColor: seller?.store?.theme.buttonBgColor || '#B9FE13',
      buttonBorder: seller?.store?.theme.buttonBorder || 'border-none',
      spacing: seller?.store?.theme.spacing || 'normal',
      shadow: seller?.store?.theme.shadow || 'shadow-none',
      adsImageUrl: seller?.store?.theme.adsImageUrl || 'null',
      ...(seller.store || {}),
    };

    return NextResponse.json(themeData);
  } catch (error) {
    console.error('Error fetching seller theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
