import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const DATABASE_SCHEMA = `
# Database Schema

## Watch Table
- id: String (unique ID)
- name: String (watch model name)
- brandId: String (foreign key to Brand)
- price: Float (current price in dollars)
- originalPrice: Float (original price, null if no discount)
- description: String (product description)
- categoryId: String (foreign key to Category)
- gender: String (e.g., "Unisex", "Men", "Women")
- stock: Int (available quantity)
- features: JSON (technical specifications)

## Brand Table
- id: String
- name: String (e.g., "Rolex", "Patek Philippe", "Titan", "Fossil", "Casio")

## Category Table  
- id: String
- name: String (e.g., "Luxury", "Sport", "Dress")

## Available Query Operations
You can filter by:
- price range (lte, gte)
- brand name (case insensitive contains)
- watch name/model (case insensitive contains)
- description (case insensitive contains)
- gender
- stock availability (gt 0)

Sorting options:
- price (asc/desc)
- createdAt (asc/desc)
- name (asc/desc)
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { params = {}, limit = 10 } = body;

        console.log("NLP Query Params:", params);

        // Use Groq to convert NLP intent to Prisma query structure
        const nlpPrompt = `You are a database query generator. Convert user search intent into a valid Prisma query structure.

${DATABASE_SCHEMA}

User Intent Parameters: ${JSON.stringify(params)}

IMPORTANT RULES FOR QUERY GENERATION:

1. PRICE FILTERING:
   - If maxPrice is provided: use {price: {lte: maxPrice}}
   - If minPrice is provided: use {price: {gte: minPrice}}
   - If BOTH provided: use {price: {gte: minPrice, lte: maxPrice}}
   - If intent is "luxury" but no price: use {price: {gte: 5000}}
   - If intent is "affordable" but no price: use {price: {lte: 1000}}
   - For "expensive" without specific price: use {price: {gte: 5000}}
   - For "cheap" without specific price: use {price: {lte: 500}}

2. BRAND FILTERING:
   - If brand is provided: use {brand: {name: {equals: "BrandName", mode: "insensitive"}}}
   - For partial brand match: use {brand: {name: {contains: "BrandName", mode: "insensitive"}}}

3. MODEL/NAME FILTERING:
   - If model is provided: use {name: {contains: "ModelName", mode: "insensitive"}}

4. COMBINED FILTERS:
   - Use AND to combine multiple conditions: {AND: [{condition1}, {condition2}]}
   - Example: {AND: [{price: {gte: 10000}}, {brand: {name: {contains: "Rolex", mode: "insensitive"}}}]}

5. SORTING:
   - For price range queries: sort by {price: "asc"}
   - For luxury/expensive queries: sort by {price: "desc"}
   - For affordable/cheap queries: sort by {price: "asc"}
   - Default: {createdAt: "desc"}

6. SPECIAL CASES:
   - If no filters at all: return {where: {}, orderBy: {createdAt: "desc"}}
   - Always ensure stock > 0 is implied (add {stock: {gt: 0}} to AND clause)

Return ONLY valid JSON (no markdown, no explanation outside the reasoning field):
{
  "where": { /* Prisma where clause */ },
  "orderBy": { /* Prisma orderBy clause */ },
  "reasoning": "Brief explanation of the query logic"
}

EXAMPLES:
Input: {"maxPrice": 50000, "minPrice": 10000}
Output: {"where": {"AND": [{"price": {"gte": 10000, "lte": 50000}}, {"stock": {"gt": 0}}]}, "orderBy": {"price": "asc"}, "reasoning": "Price range filter with stock check"}

Input: {"intent": "luxury"}
Output: {"where": {"AND": [{"price": {"gte": 5000}}, {"stock": {"gt": 0}}]}, "orderBy": {"price": "desc"}, "reasoning": "Luxury watches sorted by highest price"}

Input: {"brand": "Rolex", "maxPrice": 30000}
Output: {"where": {"AND": [{"brand": {"name": {"equals": "Rolex", "mode": "insensitive"}}}, {"price": {"lte": 30000}}, {"stock": {"gt": 0}}]}, "orderBy": {"price": "asc"}, "reasoning": "Rolex watches under $30k"}`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: nlpPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
        });

        let queryStructure;
        try {
            let responseText = completion.choices[0]?.message?.content || "{}";

            // Clean markdown code blocks
            if (responseText.includes("```")) {
                responseText = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "");
            }

            queryStructure = JSON.parse(responseText.trim());
            console.log("Generated Query Structure:", JSON.stringify(queryStructure, null, 2));
        } catch (e) {
            console.error("Failed to parse LLM response:", e);
            // Fallback to simple query
            queryStructure = {
                where: params.maxPrice ? { price: { lte: params.maxPrice } } : {},
                orderBy: { createdAt: 'desc' }
            };
        }

        // Execute the generated query
        const products = await prisma.watch.findMany({
            where: Object.keys(queryStructure.where || {}).length > 0 ? queryStructure.where : undefined,
            take: limit,
            include: {
                brand: true,
            },
            orderBy: queryStructure.orderBy || { createdAt: 'desc' },
        });

        console.log(`Found ${products.length} products`);

        const mappedProducts = products.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand.name,
            price: p.price,
            originalPrice: p.originalPrice,
            description: p.description,
            image: p.brand.image
        }));

        return NextResponse.json({
            products: mappedProducts,
            reasoning: queryStructure.reasoning
        });
    } catch (error) {
        console.error("Schema-aware search error:", error);
        return NextResponse.json({ products: [], error: "Internal Server Error" }, { status: 500 });
    }
}
