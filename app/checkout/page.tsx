"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Package, MapPin, Phone, Calendar } from "lucide-react";

interface CartItem {
    id: string;
    name: string;
    price: number;
    brand: string;
    quantity: number;
}

export default function CheckoutPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    useEffect(() => {
        if (!user) {
            router.push("/");
            return;
        }
        fetchCart();
    }, [user, router]);

    const fetchCart = async () => {
        try {
            const response = await fetch("/api/cart");
            const data = await response.json();
            setItems(data.items || []);

            if (data.items.length === 0) {
                router.push("/cart");
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const response = await fetch("/api/orders/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ deliveryAddress, phoneNumber }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/order-confirmation?orderId=${data.order.id}`);
            } else {
                alert(data.error || "Failed to place order");
            }
        } catch (error) {
            console.error("Order creation error:", error);
            alert("Failed to place order");
        } finally {
            setSubmitting(false);
        }
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (loading) {
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
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">Checkout</h1>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Delivery Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <GlassCard className="p-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-emerald-400" />
                                Delivery Information
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-2">
                                        Full Delivery Address *
                                    </label>
                                    <textarea
                                        value={deliveryAddress}
                                        onChange={(e) => setDeliveryAddress(e.target.value)}
                                        required
                                        rows={4}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                                        placeholder="Enter your complete delivery address including street, city, state, and postal code"
                                    />
                                </div>

                                <div>
                                    <label className="block text-white/80 text-sm font-medium mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-emerald-500/50 transition-colors"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>
                        </GlassCard>

                        <GlassCard className="p-6">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Calendar className="w-6 h-6 text-emerald-400" />
                                Estimated Delivery
                            </h2>
                            <p className="text-white/80">
                                Your order will be delivered within <span className="text-emerald-400 font-bold">5-10 business days</span> after placing the order.
                            </p>
                        </GlassCard>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Package className="w-6 h-6 text-emerald-400" />
                                Order Summary
                            </h2>

                            <div className="space-y-4 mb-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex justify-between text-sm">
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{item.name}</p>
                                            <p className="text-white/60 text-xs">
                                                {item.brand} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="text-white font-semibold">
                                            ${(item.price * item.quantity).toLocaleString()}
                                        </p>
                                    </div>
                                ))}

                                <div className="border-t border-white/10 pt-4 space-y-2">
                                    <div className="flex justify-between text-white/80">
                                        <span>Subtotal</span>
                                        <span>${total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-white/80">
                                        <span>Shipping</span>
                                        <span className="text-emerald-400">FREE</span>
                                    </div>
                                    <div className="border-t border-white/10 pt-2 flex justify-between text-xl font-bold">
                                        <span>Total</span>
                                        <span>${total.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-black font-bold py-4 rounded-lg transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:scale-100"
                            >
                                {submitting ? "Placing Order..." : "Place Order"}
                            </button>

                            <p className="text-white/40 text-xs text-center mt-4">
                                By placing your order, you agree to our terms and conditions
                            </p>
                        </GlassCard>
                    </div>
                </form>
            </div>
        </div>
    );
}
