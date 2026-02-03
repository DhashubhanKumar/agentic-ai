"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ShoppingCart, Plus } from "lucide-react";
import GlassCard from "../ui/GlassCard";
import { getWatchPlaceholder } from "@/lib/imageUtils";
import toast from "react-hot-toast";

interface Product {
    id: string;
    name: string;
    price: number;
    brand: { name: string };
    category: { name: string };
}

interface ProductGridProps {
    products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
    const handleAddToCart = async (e: React.MouseEvent, productId: string, productName: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId: productId }),
            });

            if (response.ok) {
                toast.success(`${productName} added to cart!`, {
                    icon: "🛒",
                    style: {
                        background: "#10b981",
                        color: "#fff",
                    },
                });
            } else {
                const data = await response.json();
                toast.error(data.error || "Please login to add to cart");
            }
        } catch (error) {
            toast.error("Failed to add to cart");
        }
    };

    const handleAddToWishlist = async (e: React.MouseEvent, productId: string, productName: string) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            const response = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId: productId }),
            });

            if (response.ok) {
                toast.success(`${productName} added to wishlist!`, {
                    icon: "❤️",
                    style: {
                        background: "#ef4444",
                        color: "#fff",
                    },
                });
            } else {
                const data = await response.json();
                toast.error(data.error || "Please login to add to wishlist");
            }
        } catch (error) {
            toast.error("Failed to add to wishlist");
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product, index) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                    <GlassCard className="group overflow-hidden relative">
                        <div className="h-64 overflow-hidden relative">
                            {/* Link to product detail page */}
                            <Link href={`/shop/${product.id}`} className="absolute inset-0 z-10" />

                            <img
                                src={getWatchPlaceholder(product.name, product.brand.name)}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <button
                                onClick={(e) => handleAddToCart(e, product.id, product.name)}
                                className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-md p-3 rounded-full text-white hover:bg-secondary-gold hover:text-black transition-colors transform translate-x-12 group-hover:translate-x-0"
                            >
                                <ShoppingCart className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 relative">
                            {/* Link to detail */}
                            <Link href={`/shop/${product.id}`} className="absolute inset-0 z-0" />

                            <p className="text-secondary-gold text-xs uppercase tracking-wider mb-1 px-1 relative z-10 w-fit">{product.brand.name}</p>
                            <h3 className="text-white text-lg font-bold mb-2 relative z-10 w-fit">{product.name}</h3>
                            <div className="flex justify-between items-center relative z-20">
                                <span className="text-white/80">${product.price.toLocaleString()}</span>
                                <div className="flex space-x-2">
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => handleAddToWishlist(e, product.id, product.name)}
                                        className="text-white/40 hover:text-red-500 transition-colors p-2"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                                        </svg>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>
            ))}
        </div>
    );
}
