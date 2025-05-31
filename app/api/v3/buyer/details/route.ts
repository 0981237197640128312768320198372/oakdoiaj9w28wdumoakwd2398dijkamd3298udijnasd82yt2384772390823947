/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from 'next/server';
import { Buyer } from '@/models/v3/Buyer';
import { verifyBuyerAuth } from '@/lib/utils';
import { connectToDatabase } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyBuyerAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const buyerId = authResult.userId;

    // Find buyer by ID
    const buyer = await Buyer.findById(buyerId)
      .select('-password -personalKey') // Exclude sensitive data
      .populate({
        path: 'sellerInteractions.seller',
        select: 'username store.name store.logoUrl', // Only select non-sensitive seller data
      });

    if (!buyer) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 });
    }

    // Format the response to include only necessary data
    const buyerDetails = {
      id: buyer._id,
      email: buyer.email,
      username: buyer.username,
      contact: buyer.contact,
      balance: buyer.balance,
      history: buyer.history.map(
        (item: {
          type: any;
          amount: any;
          description: any;
          reference: any;
          status: any;
          createdAt: any;
        }) => ({
          type: item.type,
          amount: item.amount,
          description: item.description,
          reference: item.reference,
          status: item.status,
          createdAt: item.createdAt,
        })
      ),
      sellerInteractions: buyer.sellerInteractions.map(
        (interaction: {
          _id: any;
          seller: { _id: any; username: any; store: { name: any; logoUrl: any } };
          action: any;
          rating: any;
          credit: any;
          comment: any;
          createdAt: any;
        }) => ({
          id: interaction._id,
          seller: {
            id: interaction.seller._id,
            username: interaction.seller.username,
            storeName: interaction.seller.store?.name,
            logoUrl: interaction.seller.store?.logoUrl,
          },
          action: interaction.action,
          rating: interaction.rating,
          credit: interaction.credit,
          comment: interaction.comment,
          createdAt: interaction.createdAt,
        })
      ),
      createdAt: buyer.createdAt,
      updatedAt: buyer.updatedAt,
    };

    return NextResponse.json({
      success: true,
      buyer: buyerDetails,
    });
  } catch (error) {
    console.error('Buyer details error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while fetching buyer details' },
      { status: 500 }
    );
  }
}

// For updating buyer details
export async function PATCH(request: NextRequest) {
  try {
    await connectToDatabase();

    // Verify authentication
    const authResult = await verifyBuyerAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.message }, { status: 401 });
    }

    const buyerId = authResult.userId;
    const body = await request.json();

    // Fields that can be updated
    const {
      name,
      username,
      contact,
      password,
      currentPassword,
      avatarUrl,
      // Don't allow direct updates to sensitive fields like personalKey, balance
    } = body;

    // Find buyer by ID
    const buyer = await Buyer.findById(buyerId);

    if (!buyer) {
      return NextResponse.json({ success: false, message: 'Buyer not found' }, { status: 404 });
    }

    // Update name if provided
    if (name) {
      buyer.name = name;
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== buyer.username) {
      const existingUsername = await Buyer.findOne({ username });
      if (existingUsername && existingUsername._id.toString() !== buyerId) {
        return NextResponse.json(
          { success: false, message: 'Username already in use' },
          { status: 400 }
        );
      }
      buyer.username = username;
    }

    // Update contact information if provided
    if (contact) {
      buyer.contact = {
        ...buyer.contact,
        ...contact,
      };
    }

    // Update avatar if provided
    if (avatarUrl) {
      // In a real implementation, you might want to validate the URL
      // or handle file uploads differently
      buyer.avatarUrl = avatarUrl;
    }

    // Update password if provided
    if (password && currentPassword) {
      // Verify current password
      const isPasswordValid = await buyer.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, message: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Set new password (will be hashed by the pre-save hook)
      buyer.password = password;
    } else if (password && !currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password is required to update password' },
        { status: 400 }
      );
    }

    await buyer.save();

    return NextResponse.json({
      success: true,
      message: 'Buyer details updated successfully',
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
        username: buyer.username,
        contact: buyer.contact,
        avatarUrl: buyer.avatarUrl,
      },
    });
  } catch (error) {
    console.error('Update buyer details error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while updating buyer details' },
      { status: 500 }
    );
  }
}
