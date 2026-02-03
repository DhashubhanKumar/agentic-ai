import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const serviceKey = request.headers.get('X-Backend-Service-Key');
        const isBackendRequest = serviceKey === process.env.BACKEND_SERVICE_KEY;

        let userId: string;

        if (isBackendRequest && body.userId) {
            userId = body.userId;
        } else {
            const session = await getSession();
            if (!session) {
                return NextResponse.json(
                    { error: 'Please login to add to wishlist' },
                    { status: 401 }
                );
            }
            userId = session.userId;
        }

        const { watchId } = body;

        if (!watchId) {
            return NextResponse.json(
                { error: 'Watch ID is required' },
                { status: 400 }
            );
        }

        // Check if already in wishlist
        const existing = await prisma.wishlist.findFirst({
            where: {
                userId,
                watchId,
            },
        });

        if (existing) {
            return NextResponse.json(
                { error: 'Already in wishlist' },
                { status: 400 }
            );
        }

        const wishlistItem = await prisma.wishlist.create({
            data: {
                userId,
                watchId,
            },
        });

        return NextResponse.json({ success: true, item: wishlistItem });
    } catch (error) {
        console.error('Add to wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to add to wishlist' },
            { status: 500 }
        );
    }
}

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

        await prisma.wishlist.deleteMany({
            where: {
                userId: session.userId,
                watchId,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Remove from wishlist error:', error);
        return NextResponse.json(
            { error: 'Failed to remove from wishlist' },
            { status: 500 }
        );
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const serviceKey = request.headers.get('X-Backend-Service-Key');
        const isBackendRequest = serviceKey === process.env.BACKEND_SERVICE_KEY;
        const userIdParam = searchParams.get('userId');

        let userId: string | undefined;

        if (isBackendRequest && userIdParam) {
            userId = userIdParam;
        } else {
            const session = await getSession();
            if (!session) {
                return NextResponse.json({ items: [] });
            }
            userId = session.userId;
        }

        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId },
            include: {
                watch: {
                    include: {
                        brand: true,
                        category: true,
                    },
                },
            },
        });

        const items = wishlistItems.map((item) => ({
            id: item.watch.id,
            name: item.watch.name,
            price: item.watch.price,
            brand: item.watch.brand.name,
            category: item.watch.category.name,
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Get wishlist error:', error);
        return NextResponse.json({ items: [] });
    }
}
