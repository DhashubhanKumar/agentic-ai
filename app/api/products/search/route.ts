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
        const hasAffordableIntent = /\b(affordable|budget|cheap|inexpensive|economical)\b/.test(lowerQuery);

        // Price range detection
        const priceMatch = lowerQuery.match(/under\s+(\d+)/);
        const maxPrice = priceMatch ? parseInt(priceMatch[1]) : null;

        // Remove intent keywords from search term to avoid matching them in description literal text
        const finalTerm = cleanedQuery
            .replace(/\b(discount|sale|offer|cheap|deal|promo|luxury|expensive|premium|exclusive|watch|watches|affordable|budget|inexpensive|economical|best|seller|popular|under|price)\b/g, '')
            .trim();

        // 3. Construct Prisma Query
        const whereClause: any = {};

        // Only add text search if we have meaningful terms
        if (finalTerm.length > 0) {
            whereClause.OR = [
                { name: { contains: finalTerm, mode: "insensitive" } },
                { description: { contains: finalTerm, mode: "insensitive" } },
                { brand: { name: { contains: finalTerm, mode: "insensitive" } } },
            ];
        }

        // Apply price filter if specified
        if (maxPrice) {
            whereClause.price = { lte: maxPrice };
        } else if (hasAffordableIntent) {
            whereClause.price = { lte: 1000 }; // Affordable = under $1000
        }

        // If explicitly asking for discount, enforce price check
        if (hasDiscountIntent) {
            whereClause.AND = [
                { originalPrice: { gt: 0 } },
            ];
        }

        // 4. Execution with Sorting
        const products = await prisma.watch.findMany({
            where: Object.keys(whereClause).length > 0 ? whereClause : undefined,
            take: 10,
            include: {
                brand: true,
            },
            orderBy: hasLuxuryIntent || hasAffordableIntent === false && maxPrice === null
                ? { price: 'desc' }
                : hasDiscountIntent || hasAffordableIntent
                    ? { price: 'asc' }
                    : { createdAt: 'desc' }, // Default: newest first
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
