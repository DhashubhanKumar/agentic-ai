import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: 'Please login to place an order' },
                { status: 401 }
            );
        }

        const { deliveryAddress, phoneNumber } = await request.json();

        if (!deliveryAddress || !phoneNumber) {
            return NextResponse.json(
                { error: 'Delivery address and phone number are required' },
                { status: 400 }
            );
        }

        // Get cart items
        const cartItems = await prisma.cartItem.findMany({
            where: { userId: session.userId },
            include: { watch: true },
        });

        if (cartItems.length === 0) {
            return NextResponse.json(
                { error: 'Cart is empty' },
                { status: 400 }
            );
        }

        // Calculate total
        const total = cartItems.reduce(
            (sum, item) => sum + item.watch.price * item.quantity,
            0
        );

        // Calculate estimated delivery (5-10 days from now)
        const estimatedDeliveryDays = Math.floor(Math.random() * 6) + 5; // 5-10 days
        const estimatedDelivery = new Date();
        estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDeliveryDays);

        // Create order with items
        const order = await prisma.order.create({
            data: {
                userId: session.userId,
                total,
                status: 'Processing',
                deliveryAddress,
                phoneNumber,
                estimatedDelivery,
                items: {
                    create: cartItems.map((item) => ({
                        watchId: item.watchId,
                        quantity: item.quantity,
                        price: item.watch.price,
                    })),
                },
            },
            include: {
                items: {
                    include: {
                        watch: {
                            include: {
                                brand: true,
                            },
                        },
                    },
                },
            },
        });

        // Clear cart
        await prisma.cartItem.deleteMany({
            where: { userId: session.userId },
        });

        // Update user address if provided
        if (deliveryAddress) {
            await prisma.user.update({
                where: { id: session.userId },
                data: { address: deliveryAddress },
            });
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                total: order.total,
                status: order.status,
                estimatedDelivery: order.estimatedDelivery,
                deliveryAddress: order.deliveryAddress,
                items: order.items,
            },
        });
    } catch (error) {
        console.error('Create order error:', error);
        return NextResponse.json(
            { error: 'Failed to create order' },
            { status: 500 }
        );
    }
}
