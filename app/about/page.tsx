"use client";

import GlassCard from "@/components/ui/GlassCard";
import { motion } from "framer-motion";
import { Clock, Shield, Globe, PenTool } from "lucide-react";

const stats = [
    { label: "Years of Excellence", value: "15+" },
    { label: "Curated Brands", value: "50+" },
    { label: "Watches Sold", value: "10k+" },
    { label: "Happy Collectors", value: "8.5k+" },
];

const features = [
    { icon: Shield, title: "Authenticity Guaranteed", desc: "Every timepiece undergoes rigorous inspection by our certified master watchmakers." },
    { icon: Globe, title: "Global Sourcing", desc: "We scour the globe to find rare and exclusive pieces that tell a unique story." },
    { icon: Clock, title: "Timeless Value", desc: "Investing in a watch is investing in a legacy. We guide you to pieces that retain value." },
    { icon: PenTool, title: "Master Craftsmanship", desc: "Celebrating the art of horology, we support independent watchmakers and historic maisons alike." },
];

export default function AboutPage() {
    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            {/* Hero Section */}
            <div className="relative py-32 flex items-center justify-center">
                <div className="absolute inset-0 z-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black" />
                    <img src="https://images.unsplash.com/photo-1547996663-b8308c623916?q=80&w=2574&auto=format&fit=crop" className="w-full h-full object-cover" />
                </div>

                <div className="container mx-auto px-6 relative z-10 text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-secondary-gold to-white"
                    >
                        CHRONOS.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto"
                    >
                        Where time stands still, and legacy begins.
                    </motion.p>
                </div>
            </div>

            {/* Stats Section */}
            <div className="container mx-auto px-6 mb-32">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {stats.map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <GlassCard className="p-8 text-center hover:bg-white/10 transition-colors">
                                <h3 className="text-4xl font-bold text-secondary-gold mb-2">{stat.value}</h3>
                                <p className="text-gray-400 text-sm uppercase tracking-wider">{stat.label}</p>
                            </GlassCard>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Story Section */}
            <div className="container mx-auto px-6 mb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-4xl font-bold mb-6">A Legacy of <span className="text-secondary-gold">Precision</span></h2>
                        <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                            <p>
                                Founded in 2026, Chronos was born from a simple belief: Time is our most precious asset, and how we measure it matters.
                                We curate the world's finest timepieces, bridging the gap between historical craftsmanship and modern innovation.
                            </p>
                            <p>
                                Our collection features only the most distinguished brands, verified for authenticity and precision.
                                Whether you are looking for a rugged diver's watch, a sophisticated dress watch, or a complex chronograph,
                                Chronos is your trusted partner in the journey of horology.
                            </p>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative"
                    >
                        <div className="absolute -inset-4 bg-secondary-gold/20 rounded-full blur-3xl" />
                        <img
                            src="https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=2680&auto=format&fit=crop"
                            className="relative rounded-2xl shadow-2xl border border-white/10"
                        />
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="bg-white/5 py-32">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Choose Chronos</h2>
                        <div className="w-24 h-1 bg-secondary-gold mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {features.map((f, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <GlassCard className="p-8 flex items-start space-x-6 h-full hover:bg-white/10 transition-all cursor-default">
                                    <div className="p-4 bg-secondary-gold/10 rounded-xl text-secondary-gold">
                                        <f.icon className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                        <p className="text-gray-400 leading-relaxed">{f.desc}</p>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
