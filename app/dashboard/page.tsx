import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: {
            orders: {
                orderBy: { createdAt: 'desc' },
                include: { items: true }
            },
            wishlist: {
                include: { watch: true }
            }
        }
    });

    if (!user) {
        redirect("/");
    }

    return (
        <div className="container mx-auto px-6 py-24 min-h-screen">
            <DashboardClient user={user} />
        </div>
    );
}
