import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { items, total } = body;

        if (!items || items.length === 0) {
            return new NextResponse("No items in checkout", { status: 400 });
        }

        const userEmail = session.user.email;

        // Use transaction to ensure order and items are created together
        const order = await prisma.$transaction(async (tx) => {
            // 1. Get User
            const user = await tx.user.findUnique({
                where: { email: userEmail }
            });

            if (!user) {
                throw new Error("User not found");
            }

            // 2. Create Order
            const newOrder = await tx.order.create({
                data: {
                    userId: user.id,
                    status: "processing",
                    total: parseFloat(total.toString()),
                    items: {
                        create: items.map((item: any) => ({
                            watchId: item.id,
                            quantity: item.quantity || 1,
                            price: parseFloat(item.price.toString())
                        }))
                    }
                }
            });

            // 3. Update stock (Optional implementation)
            for (const item of items) {
                await tx.watch.update({
                    where: { id: item.id },
                    data: {
                        stock: {
                            decrement: item.quantity || 1
                        }
                    }
                });
            }

            return newOrder;
        });

        return NextResponse.json(order);

    } catch (error) {
        console.log("[CHECKOUT_ERROR]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
