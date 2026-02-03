import ProductGrid from "@/components/shop/ProductGrid";
import ProductFilter from "@/components/shop/ProductFilter";
import { prisma } from "@/lib/prisma";

interface ShopPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
    const params = await searchParams;
    const brandName = params.brand as string | undefined;
    const categoryName = params.category as string | undefined;

    const where: any = {};
    if (brandName) {
        where.brand = { name: brandName };
    }
    if (categoryName) {
        where.category = { name: categoryName };
    }

    // Fetch filters data
    const [brands, categories, watches] = await Promise.all([
        prisma.brand.findMany({ orderBy: { name: 'asc' } }),
        prisma.category.findMany({ orderBy: { name: 'asc' } }),
        prisma.watch.findMany({
            where,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                brand: true,
                category: true
            }
        })
    ]);

    return (
        <div className="container mx-auto px-6 py-24">
            <div className="mb-12">
                <h1 className="text-5xl font-bold text-white mb-4">
                    {brandName ? `${brandName} Collection` : categoryName ? `${categoryName} Timepieces` : 'The Collection'}
                </h1>
                <p className="text-gray-400 max-w-2xl">
                    Explore our curated selection. {brandName ? `Discover the precision and elegance of ${brandName}.` : 'Find the perfect companion for your journey.'}
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Filter */}
                <aside className="w-full lg:w-64 flex-shrink-0">
                    <div className="sticky top-24">
                        <ProductFilter brands={brands} categories={categories} />
                    </div>
                </aside>

                {/* Main Grid */}
                <main className="flex-1">
                    <ProductGrid products={watches} />
                </main>
            </div>
        </div>
    );
}
