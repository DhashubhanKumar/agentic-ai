import GlassCard from "@/components/ui/GlassCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function BrandsPage() {
    const brands = await prisma.brand.findMany({
        orderBy: { name: 'asc' }
    });

    return (
        <div className="container mx-auto px-6 py-24 min-h-screen text-white">
            <h1 className="text-5xl font-bold mb-12">Our Brands</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {brands.map((brand) => (
                    <Link key={brand.id} href={`/shop?brand=${encodeURIComponent(brand.name)}`}>
                        <GlassCard className="p-8 hover:bg-white/10 transition-colors cursor-pointer group h-full flex flex-col justify-between relative overflow-hidden">
                            {/* Background Image Effect */}
                            {brand.image && (
                                <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <img src={brand.image} alt={brand.name} className="w-full h-full object-cover grayscale" />
                                </div>
                            )}

                            <div className="relative z-10">
                                <h2 className="text-3xl font-bold mb-2 group-hover:text-secondary-gold transition-colors">{brand.name}</h2>
                            </div>
                            <div className="mt-8 flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors relative z-10">
                                View Collection <ArrowRight className="ml-2 w-4 h-4" />
                            </div>
                        </GlassCard>
                    </Link>
                ))}
            </div>
        </div>
    );
}
