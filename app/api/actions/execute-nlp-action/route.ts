import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * NLP-to-Action Endpoint
 * Autonomously executes cart/wishlist/order actions based on natural language
 * 
 * Examples:
 * - "add the cheapest watch to cart" → Finds cheapest → Adds to cart
 * - "add that Rolex to wishlist" → Finds Rolex from context → Adds to wishlist
 * - "buy the expensive one" → Finds expensive watch → Creates order
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            userMessage,
            userId,
            conversationContext = [],
            retrievedProducts = []
        } = body;

        console.log("NLP Action Request:", { userMessage, userId });

        // Step 1: Extract action intent and watch reference
        const extractionPrompt = `Analyze this user message and extract the action and watch reference.

User Message: "${userMessage}"

Conversation Context (recent products shown):
${retrievedProducts.map((p: any) => `- ${p.name} by ${p.brand} (ID: ${p.id})`).join('\n') || 'No products in context'}

Extract:
1. ACTION: One of:
   - "add_to_cart"
   - "update_cart_quantity"
   - "add_to_wishlist"
   - "remove_from_cart"
   - "remove_from_wishlist"
   - "cart_to_order" - Place order using cart items.
   - "wishlist_to_cart" - Move wishlist items to cart.
   - "wishlist_to_order" - Buy items in wishlist.
   - "clear_cart" - Remove ALL items from cart ("remove all", "clear cart", "empty cart")
   - "clear_wishlist" - Remove ALL items from wishlist
   - "create_order" - Place order

2. WATCH_REFERENCE:
   - "cheapest" / "expensive"
   - "that one" / "it" (refers to first item in context)
   - Specific Name: "f91w", "rolex", "galaxy watch"

3. RESOLVED_WATCH_ID:
   - Look at the Conversation Context. If the user's WATCH_REFERENCE acts as a fuzzy match for any product in the context (ignoring case, hyphens, spaces), output that product's ID here.
   - Example: user says "f91w", context has "F-91W" -> use that ID.
   - Example: user says "submariner", context has "Rolex Submariner" -> use not ID.
   - If NO match in context, leave null.

4. NORMALIZED_SEARCH_TERM:
   - If no ID found in context, what should we search the DB for?
   - specific model name cleaned up (e.g. "f91w" -> "f91w", "rolex" -> "rolex")

Return JSON object with this exact structure:
{
  "action": "add_to_cart",
  "watchReference": "f91w",
  "resolvedWatchId": "cml...", 
  "normalizedSearchTerm": "F-91W",
  "quantity": 1,
  "operationType": "add"
}`;

        const extraction = await groq.chat.completions.create({
            messages: [{ role: "user", content: extractionPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            response_format: { type: "json_object" }
        });

        let actionData;
        try {
            let extractedText = extraction.choices[0]?.message?.content || "{}";
            console.log("Raw LLM Response:", extractedText); // Debug logging
            // Clean up any potential markdown formatting if the model slips up
            extractedText = extractedText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            actionData = JSON.parse(extractedText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            console.error("Failed text:", extraction.choices[0]?.message?.content);
            return NextResponse.json({
                success: false,
                error: "Could not understand the action"
            }, { status: 400 });
        }

        console.log("Extracted Action:", actionData);

        // Step 2: Resolve watch reference to actual watch ID
        let watchId: string | null = actionData.resolvedWatchId || null;
        const ref = actionData.watchReference?.toLowerCase() || "";
        const action = actionData.action;

        // Skip watch resolution for global actions
        const globalActions = ["clear_cart", "clear_wishlist", "create_order", "wishlist_to_order", "wishlist_to_cart", "cart_to_order"];
        if (!globalActions.includes(action)) {
            if (watchId) {
                console.log("Using LLM-resolved watch ID:", watchId);
            }
            else if (ref.includes("cheap") || ref === "cheapest") {
                // Find cheapest watch
                const watch = await prisma.watch.findFirst({
                    where: { stock: { gt: 0 } },
                    orderBy: { price: "asc" },
                    include: { brand: true }
                });
                watchId = watch?.id || null;
            }
            else if (ref.includes("expensive") || ref.includes("most expensive")) {
                // Find most expensive watch
                const watch = await prisma.watch.findFirst({
                    where: { stock: { gt: 0 } },
                    orderBy: { price: "desc" },
                    include: { brand: true }
                });
                watchId = watch?.id || null;
            }
            else if ((ref.includes("that") || ref.includes("this") || ref === "it")) {
                if (retrievedProducts.length > 0) {
                    watchId = retrievedProducts[0].id;
                }
            }

            // Global Fuzzy Search Fallback
            if (!watchId && actionData.watchReference) {
                const term = actionData.normalizedSearchTerm || actionData.watchReference;
                const watch = await prisma.watch.findFirst({
                    where: {
                        AND: [
                            { stock: { gt: 0 } },
                            {
                                OR: [
                                    { name: { contains: term, mode: "insensitive" } },
                                    { brand: { name: { contains: term, mode: "insensitive" } } },
                                    // Try matching without hyphens/spaces
                                    { name: { contains: term.replace(/[\s-]/g, ''), mode: "insensitive" } }
                                ]
                            }
                        ]
                    },
                    include: { brand: true }
                });
                watchId = watch?.id || null;
            }

            if (!watchId) {
                return NextResponse.json({
                    success: false,
                    error: `Could not find the watch you're referring to: "${actionData.watchReference}"`
                }, { status: 404 });
            }
        }

        // Step 3: Execute the action
        let result: any = { success: false };

        if (action === "add_to_cart") {
            const opType = actionData.operationType || "add";
            result = await addToCart(userId, watchId!, actionData.quantity || 1, opType);
        } else if (action === "update_cart_quantity") {
            result = await updateCartQuantity(userId, watchId!, actionData.quantity || 1);
        } else if (action === "add_to_wishlist") {
            result = await addToWishlist(userId, watchId!);
        } else if (action === "remove_from_cart") {
            result = await removeFromCart(userId, watchId!);
        } else if (action === "remove_from_wishlist") {
            result = await removeFromWishlist(userId, watchId!);
        } else if (action === "clear_cart") {
            await prisma.cartItem.deleteMany({ where: { userId } });
            result = { success: true, message: "Cart cleared" };
        } else if (action === "clear_wishlist") {
            await prisma.wishlist.deleteMany({ where: { userId } });
            result = { success: true, message: "Wishlist cleared" };
        } else if (action === "create_order" || action === "cart_to_order") {
            result = await createOrderFromCart(userId);
        } else if (action === "wishlist_to_cart") {
            result = await moveWishlistToCart(userId);
        } else if (action === "wishlist_to_order") {
            result = await createOrderFromWishlist(userId);
        }

        return NextResponse.json({
            success: result.success,
            message: result.message,
            watchId,
            action,
            orderId: result.orderId
        });

    } catch (error) {
        console.error("NLP Action error:", error);
        return NextResponse.json({
            success: false,
            error: "Internal server error"
        }, { status: 500 });
    }
}

// Helper functions for database operations
async function addToCart(userId: string, watchId: string, quantity: number, operationType: string = "add") {
    try {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId },
            include: { brand: true }
        });

        if (!watch) return { success: false, message: "Watch not found" };

        const cartItem = await prisma.cartItem.upsert({
            where: {
                userId_watchId: { userId, watchId }
            },
            update: {
                quantity: operationType === "set" ? quantity : { increment: quantity }
            },
            create: {
                userId,
                watchId,
                quantity
            }
        });

        return {
            success: true,
            message: `Added ${watch.name} by ${watch.brand.name} to your cart`
        };
    } catch (error) {
        return { success: false, message: "Failed to add to cart" };
    }
}

async function updateCartQuantity(userId: string, watchId: string, quantity: number) {
    try {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId },
            include: { brand: true }
        });

        if (!watch) return { success: false, message: "Watch not found" };

        const cartItem = await prisma.cartItem.update({
            where: {
                userId_watchId: { userId, watchId }
            },
            data: {
                quantity: quantity
            }
        });

        return {
            success: true,
            message: `Updated ${watch.name} quantity to ${quantity}`
        };
    } catch (error) {
        return { success: false, message: "Failed to update quantity. Make sure the item is in your cart." };
    }
}

async function addToWishlist(userId: string, watchId: string) {
    try {
        const watch = await prisma.watch.findUnique({
            where: { id: watchId },
            include: { brand: true }
        });

        if (!watch) return { success: false, message: "Watch not found" };

        await prisma.wishlist.upsert({
            where: {
                userId_watchId: { userId, watchId }
            },
            update: {},
            create: { userId, watchId }
        });

        return {
            success: true,
            message: `Added ${watch.name} by ${watch.brand.name} to your wishlist`
        };
    } catch (error) {
        return { success: false, message: "Failed to add to wishlist" };
    }
}

async function removeFromCart(userId: string, watchId: string) {
    try {
        await prisma.cartItem.delete({
            where: {
                userId_watchId: { userId, watchId }
            }
        });
        return { success: true, message: "Removed from cart" };
    } catch (error) {
        return { success: false, message: "Failed to remove from cart" };
    }
}

async function removeFromWishlist(userId: string, watchId: string) {
    try {
        await prisma.wishlist.delete({
            where: {
                userId_watchId: { userId, watchId }
            }
        });
        return { success: true, message: "Removed from wishlist" };
    } catch (error) {
        return { success: false, message: "Failed to remove from wishlist" };
    }
}

async function createOrderFromCart(userId: string) {
    try {
        const cartItems = await prisma.cartItem.findMany({
            where: { userId },
            include: { watch: { include: { brand: true } } }
        });

        if (cartItems.length === 0) {
            return { success: false, message: "Your cart is empty" };
        }

        const total = cartItems.reduce((sum, item) =>
            sum + (item.watch.price * item.quantity), 0
        );

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: "PENDING",
                items: {
                    create: cartItems.map(item => ({
                        watchId: item.watchId,
                        quantity: item.quantity,
                        price: item.watch.price
                    }))
                }
            }
        });

        // Clear cart after order
        await prisma.cartItem.deleteMany({ where: { userId } });

        return {
            success: true,
            message: `Order placed successfully! Total: $${total.toFixed(2)}`,
            orderId: order.id
        };
    } catch (error) {
        return { success: false, message: "Failed to create order" };
    }
}

async function moveWishlistToCart(userId: string) {
    try {
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId },
            include: { watch: { include: { brand: true } } }
        });

        if (wishlistItems.length === 0) return { success: false, message: "Your wishlist is empty" };

        let count = 0;
        for (const item of wishlistItems) {
            await prisma.cartItem.upsert({
                where: { userId_watchId: { userId, watchId: item.watchId } },
                update: { quantity: { increment: 1 } },
                create: { userId, watchId: item.watchId, quantity: 1 }
            });
            count++;
        }

        // Clear wishlist
        await prisma.wishlist.deleteMany({ where: { userId } });

        return { success: true, message: `Moved ${count} items from wishlist to cart.` };
    } catch (e) {
        return { success: false, message: "Failed to move items" };
    }
}

async function createOrderFromWishlist(userId: string) {
    try {
        const wishlistItems = await prisma.wishlist.findMany({
            where: { userId },
            include: { watch: { include: { brand: true } } }
        });

        if (wishlistItems.length === 0) return { success: false, message: "Your wishlist is empty" };

        const total = wishlistItems.reduce((sum, item) => sum + item.watch.price, 0);

        const order = await prisma.order.create({
            data: {
                userId,
                total,
                status: "PENDING",
                items: {
                    create: wishlistItems.map(item => ({
                        watchId: item.watchId,
                        quantity: 1,
                        price: item.watch.price
                    }))
                }
            }
        });

        // Clear wishlist
        await prisma.wishlist.deleteMany({ where: { userId } });

        return {
            success: true,
            message: `Order placed from wishlist! Total: $${total.toFixed(2)}`,
            orderId: order.id
        };
    } catch (e) {
        return { success: false, message: "Failed to create order from wishlist" };
    }
}
