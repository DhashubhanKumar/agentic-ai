import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { query } = body;

        if (!query) {
            return NextResponse.json({ products: [] });
        }

        // 1. Preprocessing: Remove common stopwords to focus on intent keywords
        const lowerQuery = query.toLowerCase();
        // Remove conversational filler
        const cleanedQuery = lowerQuery
            .replace(/\b(i|want|need|show|me|looking|for|some|can|you|find|get|a|an|the|is|are|with|of)\b/g, '')
            .trim();

        // 2. Intent Detection
        const hasDiscountIntent = /\b(discount|sale|offer|cheap|deal|promo)\b/.test(lowerQuery);
        const hasLuxuryIntent = /\b(luxury|expensive|premium|exclusive)\b/.test(lowerQuery);

        // Remove intent keywords from search term to avoid matching them in description literal text
        const finalTerm = cleanedQuery
            .replace(/\b(discount|sale|offer|cheap|deal|promo|luxury|expensive|premium|exclusive|watch|watches)\b/g, '')
            .trim();

        // 3. Construct Prisma Query
        const whereClause: any = {
            OR: [
                { name: { contains: finalTerm, mode: "insensitive" } },
                { description: { contains: finalTerm, mode: "insensitive" } },
                { brand: { name: { contains: finalTerm, mode: "insensitive" } } },
            ],
        };

        // If explicitly asking for discount, enforce price check
        if (hasDiscountIntent) {
            whereClause.AND = [
                { originalPrice: { gt: 0 } }, // Has an original price
                // Ideally: price < originalPrice, but Prisma doesn't support col comparison easily in where without raw query.
                // We'll filter post-fetch or assume originalPrice > 0 implies a discount context in this schema design.
                // Or simplified: Just prioritize showing them.
            ];
        }

        // 4. Execution with Sorting
        const products = await prisma.watch.findMany({
            where: whereClause,
            take: 10, // Increase limit to allow for post-filtering if needed
            include: {
                brand: true,
            },
            orderBy: hasLuxuryIntent
                ? { price: 'desc' }
                : hasDiscountIntent
                    ? { price: 'asc' }
                    : undefined,
        });

        // 5. Post-processing (refine for discounts if needed)
        // If discount intent, strictly only show actual discounts if schema supports it
        let filteredProducts = products;
        if (hasDiscountIntent) {
            filteredProducts = products.filter(p => p.originalPrice && p.price < p.originalPrice);
            // If aggressive filtering returns 0, fall back to "cheap" logic (all products sorted asc)
            if (filteredProducts.length === 0) {
                filteredProducts = products;
            }
        }

        const mappedProducts = filteredProducts.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand.name,
            price: p.price,
            originalPrice: p.originalPrice,
            description: p.description,
            image: p.brand.image // Fallback or real image logic
        }));

        return NextResponse.json({ products: mappedProducts });
    } catch (error) {
        console.error("Search API error:", error);
        return NextResponse.json({ products: [], error: "Internal Server Error" }, { status: 500 });
    }
}
