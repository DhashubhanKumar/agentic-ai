import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json({ items: [] });
        }

        const cartItems = await prisma.cartItem.findMany({
            where: { userId: session.userId },
            include: {
                watch: {
                    include: {
                        brand: true,
                        category: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Transform to match cart store format
        const items = cartItems.map((item) => ({
            id: item.watch.id,
            name: item.watch.name,
            price: item.watch.price,
            brand: item.watch.brand.name,
            category: item.watch.category.name,
            quantity: item.quantity,
        }));

        return NextResponse.json({ items });
    } catch (error) {
        console.error('Get cart error:', error);
        return NextResponse.json({ items: [] });
    }
}
