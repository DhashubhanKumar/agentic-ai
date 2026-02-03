import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

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
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
            userId = session.userId;
        }

        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: {
                    include: {
                        watch: {
                            include: {
                                brand: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 10 // Limit to recent 10 orders for now
        });

        return NextResponse.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        );
    }
}
