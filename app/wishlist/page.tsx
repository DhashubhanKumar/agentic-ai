"use client";

import { useEffect } from "react";
import { useWishlistStore } from "@/store/useWishlistStore";
import GlassCard from "@/components/ui/GlassCard";
import { Trash2, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import Link from "next/link";
import { getWatchPlaceholder } from "@/lib/imageUtils";
import toast, { Toaster } from "react-hot-toast";

export default function WishlistPage() {
    const { items, removeItem, setItems } = useWishlistStore();
    const addToCart = useCartStore((state) => state.addItem);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await fetch('/api/wishlist');
                const data = await response.json();
                if (data.items) {
                    setItems(data.items);
                }
            } catch (error) {
                console.error('Failed to fetch wishlist', error);
            }
        };

        fetchWishlist();
    }, [setItems]);

    const handleAddToCart = async (item: any) => {
        try {
            // Call the API to add to cart
            const response = await fetch('/api/cart/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    watchId: item.id,
                    quantity: 1
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Update local store
                addToCart(item);
                toast.success(`${item.name} added to cart!`, {
                    duration: 3000,
                    position: 'top-right',
                    style: {
                        background: '#10b981',
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                });
            } else {
                toast.error(data.error || 'Failed to add to cart', {
                    duration: 3000,
                    position: 'top-right',
                    style: {
                        background: '#ef4444',
                        color: '#fff',
                    },
                });
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Something went wrong. Please try again.', {
                duration: 3000,
                position: 'top-right',
                style: {
                    background: '#ef4444',
                    color: '#fff',
                },
            });
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white pt-32 pb-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
                    <div className="text-center py-20">
                        <p className="text-white/60 text-lg mb-6">Your wishlist is empty</p>
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
            <Toaster />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-4xl font-bold mb-8">My Wishlist</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <GlassCard key={item.id} className="p-6">
                            <div className="aspect-square mb-4 rounded-lg overflow-hidden bg-white/5">
                                <img
                                    src={getWatchPlaceholder(item.name, item.brand)}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="space-y-2">
                                <p className="text-emerald-400 text-xs uppercase tracking-wider">{item.brand}</p>
                                <h3 className="text-white text-lg font-bold">{item.name}</h3>
                                <p className="text-white/80 text-xl font-semibold">${item.price.toLocaleString()}</p>
                                <div className="flex space-x-2 pt-4">
                                    <button
                                        onClick={() => handleAddToCart(item)}
                                        className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                                    >
                                        <ShoppingCart className="w-4 h-4" />
                                        <span>Add to Cart</span>
                                    </button>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
