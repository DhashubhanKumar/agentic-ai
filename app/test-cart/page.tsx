"use client";

import { useState } from "react";

export default function TestCartPage() {
    const [result, setResult] = useState("");
    const [loading, setLoading] = useState(false);

    const testAddToCart = async () => {
        setLoading(true);
        setResult("Testing...");

        try {
            // First check if logged in
            const authRes = await fetch("/api/auth/me");
            const authData = await authRes.json();

            if (!authData.user) {
                setResult("❌ NOT LOGGED IN - Please login first!");
                setLoading(false);
                return;
            }

            setResult(`✅ Logged in as: ${authData.user.email}\n\nNow adding to cart...`);

            // Try to add to cart
            const cartRes = await fetch("/api/cart/add", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ watchId: "cml5fcbkx009hxfdz1epew52x" }),
            });

            const cartData = await cartRes.json();

            if (cartRes.ok) {
                setResult(`✅ SUCCESS!\n\nUser: ${authData.user.email}\n\nCart Response:\n${JSON.stringify(cartData, null, 2)}`);
            } else {
                setResult(`❌ FAILED!\n\nStatus: ${cartRes.status}\n\nError:\n${JSON.stringify(cartData, null, 2)}`);
            }
        } catch (error) {
            setResult(`❌ ERROR: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">🧪 Cart Test Page</h1>

                <div className="bg-white/10 p-6 rounded-lg mb-6">
                    <h2 className="text-2xl font-bold mb-4">Instructions:</h2>
                    <ol className="list-decimal list-inside space-y-2">
                        <li>Make sure you're logged in (use user@test.com / password123)</li>
                        <li>Click the button below to test adding to cart</li>
                        <li>Check the result</li>
                    </ol>
                </div>

                <button
                    onClick={testAddToCart}
                    disabled={loading}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-bold py-4 px-8 rounded-lg text-xl disabled:opacity-50"
                >
                    {loading ? "Testing..." : "🧪 Test Add to Cart"}
                </button>

                {result && (
                    <div className="mt-8 bg-white/5 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-4">Result:</h3>
                        <pre className="whitespace-pre-wrap text-sm">{result}</pre>
                    </div>
                )}
            </div>
        </div>
    );
}
