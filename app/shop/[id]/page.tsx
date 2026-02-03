"use client";

import { prisma } from "@/lib/prisma";
import { notFound, useRouter } from "next/navigation";
import { ThreeDProductCard } from "@/components/product/ThreeDProductCard";
import { ArrowLeft, ShoppingCart, Heart, Shield, Clock, Award } from "lucide-react";
import Link from "next/link";
import { getWatchPlaceholder } from "@/lib/imageUtils";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const [watch, setWatch] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [watchId, setWatchId] = useState("");
    const [addingToCart, setAddingToCart] = useState(false);
    const [addingToWishlist, setAddingToWishlist] = useState(false);

    useEffect(() => {
        params.then(p => {
            setWatchId(p.id);
            fetchWatch(p.id);
        });
    }, []);

    const fetchWatch = async (id: string) => {
        try {
            const response = await fetch(`/api/watches/${id}`);
            if (!response.ok) {
                notFound();
            }
            const data = await response.json();
            setWatch(data);
        } catch (error) {
            console.error("Error fetching watch:", error);
            notFound();
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = async () => {
        setAddingToCart(true);
        try {
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${watch.name} added to cart!`, {
                    icon: "🛒",
                    duration: 3000,
                    style: {
                        background: "#10b981",
                        color: "#fff",
                    },
                });
            } else {
                toast.error(data.error || "Please login to add to cart");
            }
        } catch (error) {
            toast.error("Failed to add to cart");
        } finally {
            setAddingToCart(false);
        }
    };

    const handleAddToWishlist = async () => {
        setAddingToWishlist(true);
        try {
            const response = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(`${watch.name} added to wishlist!`, {
                    icon: "❤️",
                    duration: 3000,
                    style: {
                        background: "#ef4444",
                        color: "#fff",
                    },
                });
            } else {
                toast.error(data.error || "Please login to add to wishlist");
            }
        } catch (error) {
            toast.error("Failed to add to wishlist");
        } finally {
            setAddingToWishlist(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white pt-24 pb-12 flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (!watch) return notFound();

    const mainImage = getWatchPlaceholder(watch.name, watch.brand.name);
    const features = watch.features as { movement?: string; waterResistance?: string; caseSize?: string } || {};

    return (
        <div className="min-h-screen bg-black text-white pt-24 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link
                    href="/shop"
                    className="inline-flex items-center text-neutral-400 hover:text-emerald-400 transition-colors mb-8 group"
                >
                    <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                    Back to Collection
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
                    {/* Left: 3D Product Card */}
                    <div className="w-full flex justify-center perspective-1000">
                        <ThreeDProductCard
                            imageSrc={mainImage}
                            title={watch.name}
                            brand={watch.brand.name}
                        />
                    </div>

                    {/* Right: Product Details */}
                    <div className="space-y-8">
                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-emerald-500/20">
                                    {watch.category.name}
                                </span>
                                {watch.gender && (
                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-blue-500/20">
                                        {watch.gender}
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
                                {watch.name}
                            </h1>
                            <p className="text-xl text-neutral-400 mt-2 font-light">{watch.brand.name}</p>
                        </div>

                        <div className="flex items-baseline space-x-4">
                            <span className="text-4xl font-bold text-white">
                                ${watch.price.toLocaleString()}
                            </span>
                            {watch.originalPrice && watch.originalPrice > watch.price && (
                                <>
                                    <span className="text-xl text-neutral-500 line-through">
                                        ${watch.originalPrice.toLocaleString()}
                                    </span>
                                    <span className="text-sm text-red-400 font-semibold px-2 py-1 bg-red-400/10 rounded-md">
                                        -{Math.round(((watch.originalPrice - watch.price) / watch.originalPrice) * 100)}% OFF
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="prose prose-invert max-w-none text-neutral-300 leading-relaxed">
                            <p>{watch.description}</p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 py-6 border-y border-white/10">
                            <div className="flex items-start space-x-3">
                                <Clock className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium text-sm">Movement</p>
                                    <p className="text-neutral-400 text-sm">{features.movement || 'Automatic'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium text-sm">Water Resistance</p>
                                    <p className="text-neutral-400 text-sm">{features.waterResistance || '100m'}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Award className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium text-sm">Warranty</p>
                                    <p className="text-neutral-400 text-sm">5 Years International</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                                <div>
                                    <p className="text-white font-medium text-sm">Case Size</p>
                                    <p className="text-neutral-400 text-sm">{features.caseSize || '42mm'}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4 pt-4">
                            <button
                                onClick={handleAddToCart}
                                disabled={addingToCart}
                                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 px-8 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-2 disabled:opacity-50"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span>{addingToCart ? "Adding..." : "Add to Cart"}</span>
                            </button>
                            <button
                                onClick={handleAddToWishlist}
                                disabled={addingToWishlist}
                                className="p-4 bg-white/5 hover:bg-white/10 rounded-xl transition-all border border-white/10 text-white hover:text-emerald-400 hover:border-emerald-500/30 disabled:opacity-50"
                            >
                                <Heart className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex items-center justify-center space-x-2 text-sm text-neutral-500">
                            <Shield className="w-4 h-4" />
                            <span>Guaranteed Authentic & Brand New</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
