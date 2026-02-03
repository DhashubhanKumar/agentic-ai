"use client";

import { motion } from "framer-motion";
import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

interface CategoryWithCount {
    id: string;
    name: string;
    image: string | null;
    _count?: {
        watches: number;
    };
}

interface FeaturedCollectionsProps {
    categories: CategoryWithCount[];
}

export default function FeaturedCollections({ categories }: FeaturedCollectionsProps) {
    if (!categories || categories.length === 0) return null;

    return (
        <section className="py-24 bg-black relative">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-blue-900/20 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary-gold/10 rounded-full blur-[100px]" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="flex justify-between items-end mb-16">
                    <div>
                        <h2 className="text-4xl font-bold text-white mb-2">Shop by Category</h2>
                        <p className="text-gray-400">Curated styles for every occasion.</p>
                    </div>
                    <Link href="/shop" className="hidden md:flex items-center text-secondary-gold hover:text-white transition-colors">
                        View All Collections <ArrowUpRight className="ml-2 w-4 h-4" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                        >
                            <Link href={`/shop?category=${category.name}`}>
                                <GlassCard
                                    className="h-[400px] relative overflow-hidden group cursor-pointer"
                                    whileHover={{ y: -10 }}
                                >
                                    <div className="absolute inset-0">
                                        <img
                                            src={category.image || "/placeholder.jpg"}
                                            alt={category.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                    </div>

                                    <div className="absolute bottom-0 left-0 right-0 p-8">
                                        <span className="text-secondary-gold text-sm font-medium mb-2 block opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                                            {category._count?.watches || 0} Items
                                        </span>
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                                            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-300">
                                                <ArrowUpRight className="w-5 h-5 text-white" />
                                            </div>
                                        </div>
                                    </div>
                                </GlassCard>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
