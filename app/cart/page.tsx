"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import GlassCard from "@/components/ui/GlassCard";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getWatchPlaceholder } from "@/lib/imageUtils";

interface CartItem {
    id: string;
    name: string;
    price: number;
    brand: string;
    category: string;
    quantity: number;
}

export default function CartPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchCart();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchCart = async () => {
        try {
            const response = await fetch("/api/cart");
            const data = await response.json();
            setItems(data.items || []);
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (watchId: string, newQuantity: number) => {
        try {
            await fetch("/api/cart/update", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId, quantity: newQuantity }),
            });
            fetchCart();
        } catch (error) {
            console.error("Failed to update quantity:", error);
        }
    };

    const removeItem = async (watchId: string) => {
        try {
            await fetch(`/api/cart/remove?watchId=${watchId}`, {
                method: "DELETE",
            });
            fetchCart();
        } catch (error) {
            console.error("Failed to remove item:", error);
        }
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (!user) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/40" />
                        <h2 className="text-2xl font-bold mb-4">Please Login</h2>
                        <p className="text-white/60 mb-6">You need to be logged in to view your cart</p>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <p className="text-center text-white/60">Loading cart...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>
                    <div className="text-center py-20">
                        <ShoppingBag className="w-16 h-16 mx-auto mb-4 text-white/40" />
                        <p className="text-white/60 text-lg mb-6">Your cart is empty</p>
                        <Link
                            href="/shop"
                            className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-bold rounded-lg transition-all hover:scale-105"
                        >
                            Browse Watches
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white pt-32 pb-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">Shopping Cart</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map((item) => (
                            <GlassCard key={item.id} className="p-6">
                                <div className="flex gap-6">
                                    <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-white/5">
                                        <img
                                            src={getWatchPlaceholder(item.name, item.brand)}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between">
                                            <div>
                                                <p className="text-emerald-400 text-xs uppercase tracking-wider mb-1">
                                                    {item.brand}
                                                </p>
                                                <h3 className="text-white text-lg font-bold mb-2">{item.name}</h3>
                                                <p className="text-white/60 text-sm mb-4">{item.category}</p>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors h-fit"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <button
                                                    onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="text-white font-semibold w-8 text-center">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <p className="text-white text-xl font-bold">
                                                ${(item.price * item.quantity).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </GlassCard>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <GlassCard className="p-6 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6">
                                <div className="flex justify-between text-white/80">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>${total.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-white/80">
                                    <span>Shipping</span>
                                    <span className="text-emerald-400">FREE</span>
                                </div>
                                <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span>${total.toLocaleString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push("/checkout")}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 rounded-lg transition-all hover:scale-105 active:scale-95"
                            >
                                Proceed to Checkout
                            </button>

                            <Link
                                href="/shop"
                                className="block text-center text-emerald-400 hover:text-emerald-300 mt-4 text-sm"
                            >
                                Continue Shopping
                            </Link>
                        </GlassCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
