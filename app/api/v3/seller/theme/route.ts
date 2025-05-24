/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
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
  adsImages: string[];
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

    // Handle backward compatibility - if images array exists, use the first image
    const adsImageUrl =
      theme.customizations.ads.images?.length > 0
        ? theme.customizations.ads.images[0]
        : theme.customizations.ads.imageUrl || null;

    const themeData: ThemeType = {
      primaryColor: theme.customizations.colors.primary || 'primary',
      secondaryColor: theme.customizations.colors.secondary || 'bg-dark-800',
      fontFamily: 'AktivGroteskRegular',
      roundedness: theme.customizations.button.roundedness || 'default',
      textColor: theme.customizations.button.textColor || 'text-light-100',
      backgroundImage: null,
      buttonTextColor: theme.customizations.button.textColor || 'text-dark-800',
      buttonBgColor: theme.customizations.button.backgroundColor || 'bg-primary',
      buttonBorder: theme.customizations.button.border || 'border-none',
      spacing: 'normal',
      shadow: theme.customizations.button.shadow || 'shadow-none',
      adsImages: theme.customizations.ads.images || [], // Include all images
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

    if (updatedThemeData.customizations?.ads?.images !== undefined) {
      theme.customizations.ads.images = updatedThemeData.customizations.ads.images;
    }

    if (
      updatedThemeData.adsImageUrl !== undefined &&
      !updatedThemeData.customizations?.ads?.images
    ) {
      theme.customizations.ads.images = updatedThemeData.adsImageUrl
        ? [updatedThemeData.adsImageUrl]
        : [];
    }

    Object.assign(theme, updatedThemeData);

    await theme.save();

    return NextResponse.json({ message: 'Theme updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
