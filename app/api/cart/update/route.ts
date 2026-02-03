import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { watchId, quantity } = await request.json();

        if (!watchId || quantity === undefined) {
            return NextResponse.json(
                { error: 'Watch ID and quantity are required' },
                { status: 400 }
            );
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            await prisma.cartItem.deleteMany({
                where: {
                    userId: session.userId,
                    watchId,
                },
            });
            return NextResponse.json({ success: true });
        }

        const updated = await prisma.cartItem.updateMany({
            where: {
                userId: session.userId,
                watchId,
            },
            data: { quantity },
        });

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error('Update cart error:', error);
        return NextResponse.json(
            { error: 'Failed to update quantity' },
            { status: 500 }
        );
    }
}
