"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TiltCard from "@/components/ui/TiltCard";
import GlassCard from "@/components/ui/GlassCard"; // Keep GlassCard for thumbnails

interface ProductGalleryProps {
    images: string[];
}

export default function ProductGallery({ images }: ProductGalleryProps) {
    const [selectedImage, setSelectedImage] = useState(0);

    // Fallback if no images provided
    const displayImages = images.length > 0 ? images : ["https://placehold.co/600x600/png"];

    return (
        <div className="space-y-4">
            <TiltCard className="aspect-square relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm">
                <motion.img
                    key={selectedImage}
                    src={displayImages[selectedImage]}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ transform: "translateZ(50px)" }}
                />
            </TiltCard>

            <div className="grid grid-cols-4 gap-4">
                {displayImages.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`aspect-square rounded-xl overflow-hidden border-2 transition-colors ${selectedImage === idx ? 'border-secondary-gold' : 'border-transparent'}`}
                    >
                        <GlassCard className="w-full h-full p-0">
                            <img src={img} className="w-full h-full object-cover" />
                        </GlassCard>
                    </button>
                ))}
            </div>
        </div>
    );
}
