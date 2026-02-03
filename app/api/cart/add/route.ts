import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Please login to add items to cart' },
                { status: 401 }
            );
        }

        const { watchId, quantity = 1 } = await request.json();

        if (!watchId) {
            return NextResponse.json(
                { error: 'Watch ID is required' },
                { status: 400 }
            );
        }

        // Check if item already exists in cart
        const existingItem = await prisma.cartItem.findUnique({
            where: {
                userId_watchId: {
                    userId: session.userId,
                    watchId,
                },
            },
        });

        if (existingItem) {
            // Update quantity
            const updated = await prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity },
            });

            return NextResponse.json({ success: true, item: updated });
        } else {
            // Create new cart item
            const newItem = await prisma.cartItem.create({
                data: {
                    userId: session.userId,
                    watchId,
                    quantity,
                },
            });

            return NextResponse.json({ success: true, item: newItem });
        }
    } catch (error) {
        console.error('❌ Add to cart error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        return NextResponse.json(
            { error: 'Failed to add item to cart', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
