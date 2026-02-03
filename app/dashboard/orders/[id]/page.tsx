import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { prisma } from "@/lib/prisma";
import { ArrowLeft, Package, Calendar, MapPin } from "lucide-react";
import Link from "next/link";

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    const order = await prisma.order.findUnique({
        where: { id: params.id },
        include: {
            items: {
                include: {
                    watch: true
                }
            }
        }
    });

    if (!order) {
        return (
            <div className="container mx-auto px-6 py-24 text-white text-center">
                Order not found.
            </div>
        );
    }

    // Verify ownership
    if (session.userId !== order.userId) {
        return (
            <div className="container mx-auto px-6 py-24 text-white text-center">
                Unauthorized.
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-24 max-w-4xl">
            <Link href="/dashboard" className="inline-flex items-center text-gray-400 hover:text-white mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
            </Link>

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Order #{order.id.substring(0, 8)}</h1>
                    <div className="flex items-center space-x-4 text-gray-400 text-sm">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {order.createdAt.toLocaleDateString()}</span>
                        <span className="flex items-center"><Package className="w-4 h-4 mr-1" /> {order.status}</span>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-gray-400 text-sm">Total Amount</p>
                    <p className="text-3xl font-bold text-secondary-gold">${order.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="space-y-6">
                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Items</h3>
                    <div className="space-y-4">
                        {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                <div className="flex items-center space-x-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden">
                                        {/* Fallback image as watch model doesn't have images yet */}
                                        <img src={`https://placehold.co/400x400/000000/FFFFFF/png?text=${encodeURIComponent(item.watch.name)}`} alt={item.watch.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{item.watch.name}</p>
                                        <p className="text-gray-400 text-sm">Luxury Watch</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-white">${item.price.toLocaleString()}</p>
                                    <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>

                <GlassCard className="p-6">
                    <h3 className="text-xl font-bold text-white mb-4">Shipping Information</h3>
                    <div className="flex items-start text-gray-400">
                        <MapPin className="w-5 h-5 mr-3 mt-1 text-secondary-gold" />
                        <div>
                            <p>Mock Shipping Address</p>
                            <p>123 Luxury Lane</p>
                            <p>Beverly Hills, CA 90210</p>
                            <p className="text-xs mt-2 text-gray-600">(This is placeholder data as address wasn't saved in Order model for this demo)</p>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
