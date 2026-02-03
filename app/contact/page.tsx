"use client";

import GlassCard from "@/components/ui/GlassCard";
import { Mail, MapPin, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactPage() {
    return (
        <div className="min-h-screen py-24">
            <div className="container mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.h1
                        className="text-5xl font-bold text-white mb-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        Crafting Legacy
                    </motion.h1>
                    <motion.p
                        className="text-gray-400 max-w-2xl mx-auto"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        Since 1985, Chronos has been dedicated to the art of horology.
                        We believe that a watch is more than a timekeeper; it is a statement of intent.
                    </motion.p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <GlassCard className="p-8 h-full">
                            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                            <form className="space-y-6">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Name</label>
                                    <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Email</label>
                                    <input type="email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Message</label>
                                    <textarea rows={4} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all" />
                                </div>
                                <button type="submit" className="w-full bg-secondary-gold text-black font-bold py-4 rounded-lg hover:bg-white transition-colors">
                                    Send Message
                                </button>
                            </form>
                        </GlassCard>
                    </motion.div>

                    {/* Info & Map Placeholder */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <GlassCard className="p-8">
                                <h3 className="text-xl font-bold text-white mb-6">Visit Our Boutique</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-4 text-gray-400">
                                        <MapPin className="w-6 h-6 text-secondary-gold flex-shrink-0" />
                                        <span>123 Luxury Lane, Beverly Hills, CA 90210<br />United States</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-400">
                                        <Phone className="w-6 h-6 text-secondary-gold  flex-shrink-0" />
                                        <span>+1 (555) 123-4567</span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-gray-400">
                                        <Mail className="w-6 h-6 text-secondary-gold  flex-shrink-0" />
                                        <span>concierge@chronos.com</span>
                                    </div>
                                </div>
                            </GlassCard>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="h-64 rounded-2xl overflow-hidden relative"
                        >
                            {/* Map Placeholder Image */}
                            <img
                                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2674&auto=format&fit=crop"
                                alt="Store Location"
                                className="w-full h-full object-cover opacity-60"
                            />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <span className="text-white font-bold tracking-widest uppercase border border-white/30 px-6 py-2 backdrop-blur-sm">View on Map</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
