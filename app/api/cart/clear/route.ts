import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceKey = request.headers.get('X-Backend-Service-Key');
        const isBackendRequest = serviceKey === process.env.BACKEND_SERVICE_KEY;
        const userIdParam = searchParams.get('userId');

        let userId: string | undefined;
        let session = null;

        if (isBackendRequest && userIdParam) {
            userId = userIdParam;
        } else {
            session = await getSession();
            if (!session) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            userId = session.userId;
        }

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        await prisma.cartItem.deleteMany({
            where: { userId: userId },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Clear cart error:', error);
        return NextResponse.json(
            { error: 'Failed to clear cart' },
            { status: 500 }
        );
    }
}
