"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OrdersRedirect() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/dashboard?tab=orders");
    }, [router]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-secondary-gold animate-pulse text-xl font-bold">
                Redirecting to your orders...
            </div>
        </div>
    );
}
