"use client";

import GlassCard from "@/components/ui/GlassCard";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CheckoutForm() {
    const router = useRouter();
    const { items, total, clearCart } = useCartStore();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items,
                    total: total()
                }),
            });

            if (response.ok) {
                const order = await response.json();
                clearCart();
                alert(`Order placed successfully! It will deliver in 10 days.\n\nOrder ID: ${order.id}\n\nThanks for purchasing!`);
                router.refresh(); // Ensure server components re-fetch data
                router.push("/dashboard");
            } else {
                alert("Something went wrong with checkout. Ensure you are logged in.");
            }
        } catch (error) {
            console.error(error);
            alert("Error placing order.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlassCard className="p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Shipping Details</h2>
            <form onSubmit={handleCheckout} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">First Name</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Last Name</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Email Address</label>
                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                </div>

                <div className="space-y-2">
                    <label className="text-gray-400 text-sm">Address</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">City</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-gray-400 text-sm">Postal Code</label>
                        <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-secondary-gold text-black font-bold py-4 rounded-lg hover:bg-white transition-colors mt-4 disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Place Order"}
                </button>
            </form>
        </GlassCard>
    );
}
