"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ShoppingBag, User, Menu, X, LogOut, Heart, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Watches", href: "/shop" },
    { name: "Brands", href: "/brands" },
    { name: "About", href: "/about" },
];

export default function Navbar() {
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            const response = await fetch("/api/auth/me");
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            }
        } catch (error) {
            console.error("Failed to fetch user:", error);
        } finally {
            setLoading(false);
        }
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        setIsScrolled(latest > 50);
    });

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
            setUser(null);
            setShowUserMenu(false);
            router.push("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <>
            <motion.nav
                className={cn(
                    "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
                    isScrolled
                        ? "glass-nav py-4"
                        : "bg-transparent py-6"
                )}
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-secondary-gold to-amber-600 flex items-center justify-center">
                                <span className="text-black font-bold text-xl">C</span>
                            </div>
                            <span className="text-2xl font-bold text-white">Chronos</span>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-white/80 hover:text-white transition-colors relative group"
                                >
                                    {link.name}
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-secondary-gold transition-all group-hover:w-full" />
                                </Link>
                            ))}
                        </div>

                        {/* Right Side Icons */}
                        <div className="flex items-center space-x-4">
                            <Link
                                href="/cart"
                                className="relative p-2 text-white/80 hover:text-white transition-colors"
                            >
                                <ShoppingBag className="w-6 h-6" />
                            </Link>

                            <Link
                                href="/wishlist"
                                className="relative p-2 text-white/80 hover:text-white transition-colors"
                            >
                                <Heart className="w-6 h-6" />
                            </Link>

                            {/* User Menu */}
                            {!loading && (
                                <div className="relative">
                                    {user ? (
                                        <>
                                            <button
                                                onClick={() => setShowUserMenu(!showUserMenu)}
                                                className="p-2 text-white/80 hover:text-white transition-colors"
                                            >
                                                <User className="w-6 h-6" />
                                            </button>

                                            {showUserMenu && (
                                                <div className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-lg shadow-xl py-2">
                                                    <div className="px-4 py-2 border-b border-white/10">
                                                        <p className="text-white font-medium">{user.name}</p>
                                                        <p className="text-white/60 text-sm">{user.email}</p>
                                                    </div>
                                                    <Link
                                                        href="/dashboard"
                                                        className="flex items-center space-x-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <User className="w-4 h-4" />
                                                        <span>Dashboard</span>
                                                    </Link>
                                                    <Link
                                                        href="/orders"
                                                        className="flex items-center space-x-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                                        onClick={() => setShowUserMenu(false)}
                                                    >
                                                        <Package className="w-4 h-4" />
                                                        <span>Orders</span>
                                                    </Link>
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        <span>Logout</span>
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <Link
                                            href="/login"
                                            className="px-4 py-2 bg-secondary-gold text-black font-semibold rounded-lg hover:bg-white transition-colors"
                                        >
                                            Login
                                        </Link>
                                    )}
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 text-white"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="w-6 h-6" />
                                ) : (
                                    <Menu className="w-6 h-6" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden mt-4 pb-4 border-t border-white/10"
                        >
                            <div className="flex flex-col space-y-4 pt-4">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className="text-white/80 hover:text-white transition-colors"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {link.name}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>
            </motion.nav>
        </>
    );
}
