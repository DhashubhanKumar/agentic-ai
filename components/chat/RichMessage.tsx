import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { getWatchPlaceholder } from '@/lib/imageUtils';

interface Product {
    id: string;
    name: string;
    brand: string;
    price: number;
    description: string;
}

interface RichMessageProps {
    payload: Product[];
}

const RichMessage: React.FC<RichMessageProps> = ({ payload }) => {
    if (!payload || payload.length === 0) return null;

    return (
        <div className="flex space-x-4 overflow-x-auto pb-4 mt-2 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {payload.map((product) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-shrink-0 w-64 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-3 hover:bg-white/20 transition-colors"
                >
                    <div className="h-32 w-full relative rounded-lg overflow-hidden mb-3 bg-black/40">
                        {/* Placeholder image for now, can be replaced with real image url if available */}
                        <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${getWatchPlaceholder(product.name, product.brand)})` }}
                        />
                    </div>

                    <h4 className="text-white font-medium text-sm truncate">{product.name}</h4>
                    <p className="text-white/60 text-xs mb-2">{product.brand}</p>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-amber-400 font-bold text-sm">
                            ${product.price.toLocaleString()}
                        </span>
                        <Link
                            href={`/shop`} // Ideally this would link to specific product page
                            className="p-1.5 bg-amber-500/20 text-amber-500 rounded-lg hover:bg-amber-500 hover:text-white transition-colors"
                        >
                            <ShoppingCart size={14} />
                        </Link>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

export default RichMessage;
