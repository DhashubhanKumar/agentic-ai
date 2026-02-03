"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { CheckCircle, Package, MapPin, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

function OrderConfirmationContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const orderId = searchParams.get("orderId");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!orderId) {
            router.push("/");
        } else {
            setLoading(false);
        }
    }, [orderId, router]);

    if (loading || !orderId) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-white/60">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500/20 rounded-full mb-4">
                        <CheckCircle className="w-12 h-12 text-emerald-400" />
                    </div>
                    <h1 className="text-4xl font-bold mb-2">Order Placed Successfully!</h1>
                    <p className="text-white/60 text-lg">Thank you for your purchase</p>
                </div>

                <GlassCard className="p-8 mb-6">
                    <div className="space-y-6">
                        <div>
                            <p className="text-white/60 text-sm mb-1">Order ID</p>
                            <p className="text-white text-2xl font-bold font-mono">{orderId}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <Package className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-white font-semibold mb-1">Order Status</p>
                                    <p className="text-emerald-400">Processing</p>
                                    <p className="text-white/60 text-sm mt-1">
                                        We're preparing your order for shipment
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Calendar className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <p className="text-white font-semibold mb-1">Estimated Delivery</p>
                                    <p className="text-white/80">5-10 Business Days</p>
                                    <p className="text-white/60 text-sm mt-1">
                                        You'll receive tracking information soon
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/10 pt-6">
                            <p className="text-white/60 text-sm mb-4">
                                A confirmation email has been sent to your registered email address with order details.
                            </p>
                            <p className="text-white/60 text-sm">
                                You can track your order status in your dashboard.
                            </p>
                        </div>
                    </div>
                </GlassCard>

                <div className="flex flex-col sm:flex-row gap-4">
                    <Link
                        href="/dashboard"
                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 px-6 rounded-lg transition-all hover:scale-105 text-center flex items-center justify-center gap-2"
                    >
                        View My Orders
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                        href="/shop"
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-4 px-6 rounded-lg transition-all hover:scale-105 text-center"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderConfirmationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-white/60">Loading confirmation details...</p>
                </div>
            </div>
        }>
            <OrderConfirmationContent />
        </Suspense>
    );
}
