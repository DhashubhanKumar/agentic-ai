
"use client";

import React from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export function ThreeDProductCard({
    imageSrc,
    title,
    brand
}: {
    imageSrc: string;
    title: string;
    brand: string;
}) {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x);
    const mouseYSpring = useSpring(y);

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        const rect = e.currentTarget.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateY,
                rotateX,
                transformStyle: "preserve-3d",
            }}
            className="relative h-[500px] w-full max-w-md rounded-xl bg-gradient-to-br from-neutral-900 to-black border border-white/10 p-8 shadow-2xl transition-all duration-200 ease-linear hover:shadow-emerald-500/20 group cursor-pointer"
        >
            <div
                style={{ transform: "translateZ(75px)", transformStyle: "preserve-3d" }}
                className="absolute inset-4 flex flex-col items-center justify-center"
            >
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden shadow-lg border border-white/5">
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                </div>
                <h3 className="text-2xl font-bold text-white mb-1 translate-z-10">{title}</h3>
                <p className="text-emerald-400 font-medium tracking-wide uppercase text-sm">{brand}</p>

                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
            </div>
        </motion.div>
    );
}
