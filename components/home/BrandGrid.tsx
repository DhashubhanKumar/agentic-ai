"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Brand } from "@prisma/client";

interface BrandGridProps {
    brands: Brand[];
}

export default function BrandGrid({ brands }: BrandGridProps) {
    return (
        <section className="py-24 bg-black relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-secondary-gold/5 blur-[120px] rounded-full opacity-50 pointer-events-none" />

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-bold text-white mb-4">Our Brands</h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Discover timepieces from the world's most prestigious manufacturers.
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center justify-items-center">
                    {brands.map((brand, index) => (
                        <motion.div
                            key={brand.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            viewport={{ once: true }}
                            className="group"
                        >
                            <Link href={`/shop?brand=${brand.name}`} className="block p-6 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100 transform hover:scale-110">
                                {brand.image ? (
                                    <img
                                        src={brand.image}
                                        alt={brand.name}
                                        className="h-16 w-auto object-contain invert" // Invert simple black logos if they are black on transparent, otherwise remove invert. Assumed white text/logo is needed on black bg.
                                    />
                                ) : (
                                    <span className="text-xl font-bold text-white tracking-widest">{brand.name}</span>
                                )}
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
