"use client";

import { motion } from "framer-motion";
import { X, Plus, Minus } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useCartStore } from "@/store/useCartStore";

interface CartItemProps {
    item: {
        id: string;
        name: string;
        brand: string;
        price: number;
        image: string;
        quantity: number;
    };
}

export default function CartItem({ item }: CartItemProps) {
    const { removeItem, updateQuantity } = useCartStore();

    return (
        <GlassCard className="p-4 flex items-center space-x-4 mb-4">
            <div className="w-24 h-24 bg-white/5 rounded-lg p-2 flex-shrink-0">
                <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-contain"
                />
            </div>

            <div className="flex-1">
                <h4 className="text-secondary-gold text-xs uppercase mb-1">{item.brand}</h4>
                <h3 className="text-white font-bold">{item.name}</h3>
                <p className="text-gray-400 text-sm mt-1">${item.price.toLocaleString()}</p>
            </div>

            <div className="flex flex-col items-end space-y-2">
                <button
                    onClick={() => removeItem(item.id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="flex items-center space-x-3 bg-white/5 rounded-lg px-2 py-1">
                    <button
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="text-white hover:text-secondary-gold disabled:opacity-50"
                    >
                        <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-white text-sm font-medium w-4 text-center">{item.quantity}</span>
                    <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="text-white hover:text-secondary-gold"
                    >
                        <Plus className="w-3 h-3" />
                    </button>
                </div>
            </div>
        </GlassCard>
    );
}
