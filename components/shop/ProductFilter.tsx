"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Brand, Category } from "@prisma/client";

const FilterLink = ({ label, href, active }: { label: string; href: string; active: boolean }) => (
    <Link href={href} className={`flex items-center justify-between group cursor-pointer ${active ? 'text-secondary-gold' : 'text-gray-400 hover:text-white'}`}>
        <span className="text-sm transition-colors">{label}</span>
        {active && <div className="w-1.5 h-1.5 rounded-full bg-secondary-gold" />}
    </Link>
);

interface ProductFilterProps {
    brands: Brand[];
    categories: Category[];
}

export default function ProductFilter({ brands, categories }: ProductFilterProps) {
    const searchParams = useSearchParams();
    const currentCategory = searchParams.get('category');
    const currentBrand = searchParams.get('brand');

    return (
        <div className="space-y-8">
            <div>
                <Link href="/shop" className="text-white font-bold mb-4 block hover:text-secondary-gold transition-colors">
                    All Collections
                </Link>
                <div className="h-px bg-white/10 mb-6" />

                <h3 className="text-white font-bold mb-4">Categories</h3>
                <div className="space-y-3">
                    {categories.map(cat => (
                        <FilterLink
                            key={cat.id}
                            label={cat.name}
                            href={`/shop?category=${encodeURIComponent(cat.name)}`}
                            active={currentCategory === cat.name}
                        />
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-white font-bold mb-4">Brands</h3>
                <div className="space-y-3">
                    {brands.map(brand => (
                        <FilterLink
                            key={brand.id}
                            label={brand.name}
                            href={`/shop?brand=${encodeURIComponent(brand.name)}`}
                            active={currentBrand === brand.name}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
