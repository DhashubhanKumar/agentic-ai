"use client";

import { useState } from "react";
import { ShoppingCart, Heart, Truck, Shield, RotateCcw } from "lucide-react";

interface ProductInfoProps {
    product: {
        id: string;
        name: string;
        price: number;
        originalPrice?: number | null;
        description: string;
        brand: { name: string };
        category: { name: string };
        stock: number;
        features: any;
    };
}

export default function ProductInfo({ product }: ProductInfoProps) {
    const [activeTab, setActiveTab] = useState("Description");
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);

    const features = product.features as {
        movement?: string;
        waterResistance?: string;
        caseSize?: string;
    } || {};

    const handleAddToCart = async () => {
        console.log("🔵 Add to Cart button clicked!");
        console.log("🔵 Product ID:", product.id);
        console.log("🔵 Product Name:", product.name);

        setIsAddingToCart(true);
        try {
            console.log("🔵 Calling API /api/cart/add...");
            const response = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId: product.id }),
            });

            console.log("🔵 API Response status:", response.status);
            const data = await response.json();
            console.log("🔵 API Response data:", data);

            if (response.ok) {
                console.log("✅ Successfully added to cart!");
                alert("✅ Added to cart!");
            } else {
                console.log("❌ Failed:", data.error);
                alert(data.error || "Please login to add to cart");
            }
        } catch (error) {
            console.error("❌ Add to cart error:", error);
            alert("Failed to add to cart");
        } finally {
            setIsAddingToCart(false);
            console.log("🔵 Process complete");
        }
    };

    const handleAddToWishlist = async () => {
        setIsAddingToWishlist(true);
        try {
            const response = await fetch("/api/wishlist", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId: product.id }),
            });

            if (response.ok) {
                alert("❤️ Added to wishlist!");
            } else {
                const data = await response.json();
                alert(data.error || "Please login to add to wishlist");
            }
        } catch (error) {
            console.error("Add to wishlist error:", error);
            alert("Failed to add to wishlist");
        } finally {
            setIsAddingToWishlist(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <p className="text-emerald-400 text-sm uppercase tracking-wider mb-2">
                    {product.brand.name}
                </p>
                <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
                <div className="flex items-baseline space-x-4 mb-6">
                    <span className="text-3xl font-bold text-white">
                        ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice && (
                        <span className="text-xl text-neutral-500 line-through">
                            ${product.originalPrice.toLocaleString()}
                        </span>
                    )}
                </div>
            </div>

            <div className="flex space-x-4">
                <button
                    onClick={handleAddToCart}
                    disabled={isAddingToCart}
                    className="flex-1 bg-secondary-gold text-black py-4 rounded-xl font-bold text-lg hover:bg-white transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{isAddingToCart ? "Adding..." : "Add to Cart"}</span>
                </button>
                <button
                    onClick={handleAddToWishlist}
                    disabled={isAddingToWishlist}
                    className="p-4 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Heart className="w-6 h-6" />
                </button>
            </div>

            <div className="border-t border-white/10 pt-8">
                <div className="flex space-x-8 mb-6 border-b border-white/10">
                    {["Description", "Specifications", "Delivery"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-2 transition-colors relative ${activeTab === tab
                                    ? "text-white"
                                    : "text-neutral-500 hover:text-white"
                                }`}
                        >
                            {tab}
                            {activeTab === tab && (
                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-secondary-gold" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="text-neutral-300">
                    {activeTab === "Description" && (
                        <p className="leading-relaxed">{product.description}</p>
                    )}

                    {activeTab === "Specifications" && (
                        <div className="space-y-4">
                            {features.movement && (
                                <div className="flex justify-between py-3 border-b border-white/10">
                                    <span className="text-neutral-500">Movement</span>
                                    <span className="font-medium">{features.movement}</span>
                                </div>
                            )}
                            {features.caseSize && (
                                <div className="flex justify-between py-3 border-b border-white/10">
                                    <span className="text-neutral-500">Case Size</span>
                                    <span className="font-medium">{features.caseSize}</span>
                                </div>
                            )}
                            {features.waterResistance && (
                                <div className="flex justify-between py-3 border-b border-white/10">
                                    <span className="text-neutral-500">Water Resistance</span>
                                    <span className="font-medium">{features.waterResistance}</span>
                                </div>
                            )}
                            <div className="flex justify-between py-3 border-b border-white/10">
                                <span className="text-neutral-500">Category</span>
                                <span className="font-medium">{product.category.name}</span>
                            </div>
                            <div className="flex justify-between py-3">
                                <span className="text-neutral-500">Stock</span>
                                <span className="font-medium text-emerald-400">
                                    {product.stock} available
                                </span>
                            </div>
                        </div>
                    )}

                    {activeTab === "Delivery" && (
                        <div className="space-y-6">
                            <div className="flex items-start space-x-4">
                                <Truck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Free Shipping</h4>
                                    <p className="text-sm">
                                        Complimentary shipping on all orders. Delivery within 5-10
                                        business days.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">Authenticity Guaranteed</h4>
                                    <p className="text-sm">
                                        Every timepiece comes with a certificate of authenticity.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <RotateCcw className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
                                <div>
                                    <h4 className="font-semibold text-white mb-1">30-Day Returns</h4>
                                    <p className="text-sm">
                                        Not satisfied? Return within 30 days for a full refund.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
