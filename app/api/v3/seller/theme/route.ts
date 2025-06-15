/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, type NextRequest } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Seller } from '@/models/v3/Seller';
import { Theme } from '@/models/v3/Theme';
import { ThemeType } from '@/types';

interface SellerDocument {
  _id: any;
  store: {
    theme: any;
  };
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

    const seller = (await Seller.findOne({ username }).lean()) as SellerDocument | null;

    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Get theme separately to avoid populate issues
    let theme: any = null;
    if (seller.store.theme) {
      try {
        theme = await Theme.findById(seller.store.theme).lean();
      } catch (themeError) {
        console.error('Error fetching theme:', themeError);
        // Continue with null theme to return default
      }
    }

    // If no theme exists, return default theme instead of 404
    if (!theme) {
      const defaultTheme: ThemeType = {
        sellerId: seller._id,
        baseTheme: 'light',
        customizations: {
          colors: {
            primary: 'primary',
            secondary: 'bg-dark-800',
          },
          button: {
            textColor: 'text-dark-800',
            backgroundColor: 'primary',
            roundedness: 'md',
            shadow: 'sm',
            border: 'none',
            borderColor: 'primary',
          },
          componentStyles: {
            cardRoundedness: 'md',
            cardShadow: 'sm',
          },
          ads: {
            images: [],
            roundedness: 'md',
            shadow: 'sm',
          },
        },
      };
      return NextResponse.json(defaultTheme);
    }

    // Return the complete theme data matching the model structure
    const themeData: ThemeType = {
      sellerId: theme.sellerId,
      baseTheme: theme.baseTheme || 'light',
      customizations: {
        colors: {
          primary: theme.customizations?.colors?.primary || 'primary',
          secondary: theme.customizations?.colors?.secondary || 'bg-dark-800',
        },
        button: {
          textColor: theme.customizations?.button?.textColor || 'text-dark-800',
          backgroundColor: theme.customizations?.button?.backgroundColor || 'bg-primary',
          roundedness: theme.customizations?.button?.roundedness || 'md',
          shadow: theme.customizations?.button?.shadow || 'sm',
          border: theme.customizations?.button?.border || 'none',
          borderColor: theme.customizations?.button?.borderColor || 'border-primary',
        },
        componentStyles: {
          cardRoundedness: theme.customizations?.componentStyles?.cardRoundedness || 'md',
          cardShadow: theme.customizations?.componentStyles?.cardShadow || 'sm',
        },
        ads: {
          images: theme.customizations?.ads?.images || [],
          roundedness: theme.customizations?.ads?.roundedness || 'md',
          shadow: theme.customizations?.ads?.shadow || 'sm',
        },
      },
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

    let theme;
    const themeId = seller.store.theme;

    if (!themeId) {
      // Create a new theme if none exists
      theme = new Theme({
        sellerId: seller._id,
        baseTheme: updatedThemeData.baseTheme || 'dark',
        customizations: {
          colors: {
            primary: updatedThemeData.customizations?.colors?.primary || 'primary',
            secondary: updatedThemeData.customizations?.colors?.secondary || 'bg-dark-800',
          },
          button: {
            textColor: updatedThemeData.customizations?.button?.textColor || 'text-dark-800',
            backgroundColor:
              updatedThemeData.customizations?.button?.backgroundColor || 'bg-primary',
            roundedness: updatedThemeData.customizations?.button?.roundedness || 'md',
            shadow: updatedThemeData.customizations?.button?.shadow || 'sm',
            border: updatedThemeData.customizations?.button?.border || 'none',
            borderColor: updatedThemeData.customizations?.button?.borderColor || 'border-primary',
          },
          componentStyles: {
            cardRoundedness:
              updatedThemeData.customizations?.componentStyles?.cardRoundedness || 'md',
            cardShadow: updatedThemeData.customizations?.componentStyles?.cardShadow || 'sm',
          },
          ads: {
            images: updatedThemeData.customizations?.ads?.images || [],
            roundedness: updatedThemeData.customizations?.ads?.roundedness || 'md',
            shadow: updatedThemeData.customizations?.ads?.shadow || 'sm',
          },
        },
      });

      await theme.save({ validateBeforeSave: false });

      // Update seller to reference the new theme
      seller.store.theme = theme._id;
      await seller.save();
    } else {
      // Update existing theme
      theme = await Theme.findById(themeId);
      if (!theme) {
        return NextResponse.json({ error: 'Theme not found' }, { status: 404 });
      }
    }

    // Update baseTheme if provided
    if (updatedThemeData.baseTheme) {
      theme.baseTheme = updatedThemeData.baseTheme;
    }

    // Update customizations with proper structure
    if (updatedThemeData.customizations) {
      // Update colors
      if (updatedThemeData.customizations.colors) {
        if (updatedThemeData.customizations.colors.primary !== undefined) {
          theme.customizations.colors.primary = updatedThemeData.customizations.colors.primary;
        }
        if (updatedThemeData.customizations.colors.secondary !== undefined) {
          theme.customizations.colors.secondary = updatedThemeData.customizations.colors.secondary;
        }
      }

      // Update button styles
      if (updatedThemeData.customizations.button) {
        const buttonUpdates = updatedThemeData.customizations.button;
        if (buttonUpdates.textColor !== undefined) {
          theme.customizations.button.textColor = buttonUpdates.textColor;
        }
        if (buttonUpdates.backgroundColor !== undefined) {
          theme.customizations.button.backgroundColor = buttonUpdates.backgroundColor;
        }
        if (buttonUpdates.roundedness !== undefined) {
          theme.customizations.button.roundedness = buttonUpdates.roundedness;
        }
        if (buttonUpdates.shadow !== undefined) {
          theme.customizations.button.shadow = buttonUpdates.shadow;
        }
        if (buttonUpdates.border !== undefined) {
          theme.customizations.button.border = buttonUpdates.border;
        }
        if (buttonUpdates.borderColor !== undefined) {
          theme.customizations.button.borderColor = buttonUpdates.borderColor;
        }
      }

      // Update component styles
      if (updatedThemeData.customizations.componentStyles) {
        const componentUpdates = updatedThemeData.customizations.componentStyles;
        if (componentUpdates.cardRoundedness !== undefined) {
          theme.customizations.componentStyles.cardRoundedness = componentUpdates.cardRoundedness;
        }
        if (componentUpdates.cardShadow !== undefined) {
          theme.customizations.componentStyles.cardShadow = componentUpdates.cardShadow;
        }
      }

      // Update ads
      if (updatedThemeData.customizations.ads) {
        const adsUpdates = updatedThemeData.customizations.ads;
        if (adsUpdates.images !== undefined) {
          theme.customizations.ads.images = adsUpdates.images;
        }
        if (adsUpdates.roundedness !== undefined) {
          theme.customizations.ads.roundedness = adsUpdates.roundedness;
        }
        if (adsUpdates.shadow !== undefined) {
          theme.customizations.ads.shadow = adsUpdates.shadow;
        }
      }
    }

    // Force validation to be skipped for this save operation
    await theme.save({ validateBeforeSave: false });

    return NextResponse.json({ message: 'Theme updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating theme:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
