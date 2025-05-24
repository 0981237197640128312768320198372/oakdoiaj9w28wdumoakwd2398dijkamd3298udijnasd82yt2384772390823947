/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { Theme } from '@/models/v3/Theme'; // Import Theme model

interface SellerDocument {
  store: {
    theme: any;
  };
}

export interface ThemeType {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  roundedness: string;
  textColor: string;
  backgroundImage: string | null;
  buttonTextColor: string;
  buttonBgColor: string;
  buttonBorder: string;
  spacing: string;
  shadow: string;
  adsImageUrl: string | null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const username = body.username;

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required in the request body' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const seller = (await Seller.findOne({ username })
      .populate('store.theme')
      .lean()) as SellerDocument | null;

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const theme = seller.store.theme;
    if (!theme) {
      return NextResponse.json({ error: 'Theme not found for this seller' }, { status: 404 });
    }

    const themeData: ThemeType = {
      primaryColor: theme.customizations.colors.primary || '#B9FE13',
      secondaryColor: theme.customizations.colors.secondary || '#5E5E5E',
      fontFamily: 'AktivGroteskRegular',
      roundedness: theme.customizations.button.roundedness || 'default',
      textColor: theme.customizations.button.textColor || '#ECECEC',
      backgroundImage: null,
      buttonTextColor: theme.customizations.button.textColor || '#0F0F0F',
      buttonBgColor: theme.customizations.button.backgroundColor || '#B9FE13',
      buttonBorder: theme.customizations.button.border || 'border-none',
      spacing: 'normal',
      shadow: theme.customizations.button.shadow || 'shadow-none',
      adsImageUrl: theme.customizations.ads.imageUrl || 'null',
    };

    return NextResponse.json(themeData);
  } catch (error) {
    console.error('Error fetching seller theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();
    const { username, theme: updatedThemeData } = body;

    if (!username || !updatedThemeData) {
      return NextResponse.json({ error: 'Missing username or theme data' }, { status: 400 });
    }

    const seller = await Seller.findOne({ username });
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const themeId = seller.store.theme;
    if (!themeId) {
      return NextResponse.json({ error: 'Theme not found for this seller' }, { status: 404 });
    }

    const theme = await Theme.findById(themeId);
    if (!theme) {
      return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
    }

    Object.assign(theme, updatedThemeData);

    await theme.save();

    return NextResponse.json({ message: 'Theme updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
