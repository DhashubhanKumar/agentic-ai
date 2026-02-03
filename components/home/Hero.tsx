"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";

export default function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const y2 = useTransform(scrollY, [0, 500], [0, -150]);

    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            {/* Background with Gradient and Overlay */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-hero-gradient animate-pulse-slow" />
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547996663-b8308c623916?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90" />
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ y: y1 }}
                >
                    <motion.h1
                        className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Precision in <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary-gold to-white">
                            Every Second
                        </span>
                    </motion.h1>
                    <motion.p
                        className="text-lg md:text-xl text-gray-300 mb-8 max-w-lg"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Discover the epitome of luxury and craftsmanship.
                        Timeless designs for the modern visionary.
                    </motion.p>
                    <motion.div
                        className="flex space-x-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link href="/shop" className="group">
                            <div className="bg-secondary-gold text-black px-8 py-3 rounded-full font-medium flex items-center space-x-2 hover:bg-white transition-all transform hover:scale-105 active:scale-95">
                                <span>Shop Collection</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                        <Link href="/about">
                            <div className="bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-medium hover:bg-white/20 transition-all">
                                Our Story
                            </div>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Floating Watch Image/Card */}
                <motion.div
                    className="hidden lg:block relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.4 }}
                    style={{ y: y2 }}
                >
                    <div className="relative w-full max-w-md mx-auto">
                        <div className="absolute -inset-4 bg-secondary-gold/20 rounded-full blur-3xl animate-pulse" />
                        <GlassCard className="p-8 relative transform rotate-6 hover:rotate-0 transition-transform duration-500">
                            <img
                                src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=2680&auto=format&fit=crop"
                                alt="Luxury Watch"
                                className="rounded-lg shadow-2xl"
                            />
                            <div className="mt-6">
                                <h3 className="text-2xl font-bold text-white">Royal Oak Offshore</h3>
                                <p className="text-gray-400">Audemars Piguet</p>
                                <div className="mt-4 flex justify-between items-center">
                                    <span className="text-secondary-gold font-bold text-xl">$45,000</span>
                                    <Link href="/shop" className="text-xs text-white underline">View Details</Link>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-white/50 flex flex-col items-center"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <span className="text-xs uppercase tracking-widest mb-2">Scroll</span>
                <div className="w-px h-8 bg-gradient-to-b from-white/50 to-transparent" />
            </motion.div>
        </section>
    );
}
