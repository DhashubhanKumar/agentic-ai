"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("demo@chronos.com");
    const [password, setPassword] = useState("password");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const result = await signIn("credentials", {
            email,
            password,
            redirect: false,
        });

        if (result?.ok) {
            router.push("/dashboard");
        } else {
            setLoading(false);
            alert("Invalid credentials. Try demo@chronos.com / password");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-hero-gradient" />
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-gold/10 rounded-full blur-[120px]" />

            <div className="container mx-auto px-6 relative z-10 flex justify-center">
                <GlassCard className="w-full max-w-md p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Sign in to access your collection.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all"
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-secondary-gold focus:ring-1 focus:ring-secondary-gold transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-secondary-gold text-black font-bold py-4 rounded-xl hover:bg-white transition-colors disabled:opacity-50"
                        >
                            {loading ? "Signing In..." : "Sign In"}
                        </button>
                    </form>

                    <div className="mt-8">
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4">
                            <button
                                onClick={() => signIn("google")}
                                className="bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center text-white transition-colors"
                            >
                                <span className="font-medium">Google</span>
                            </button>
                            <button className="bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl flex items-center justify-center text-white transition-colors">
                                <span className="font-medium">Apple</span>
                            </button>
                        </div>
                    </div>

                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            Don&apos;t have an account? <Link href="/register" className="text-secondary-gold cursor-pointer hover:underline">Register</Link>
                        </p>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
