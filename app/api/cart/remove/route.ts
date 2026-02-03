import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const watchId = searchParams.get('watchId');

        if (!watchId) {
            return NextResponse.json(
                { error: 'Watch ID is required' },
                { status: 400 }
            );
        }

        await prisma.cartItem.deleteMany({
            where: {
                userId: session.userId,
                watchId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return NextResponse.json(
            { error: 'Failed to remove item' },
            { status: 500 }
        );
    }
}
