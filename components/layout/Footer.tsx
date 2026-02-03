import Link from "next/link";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-black/40 backdrop-blur-md border-t border-white/5 pt-20 pb-10">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    {/* Brand */}
                    <div className="space-y-4">
                        <h3 className="text-2xl font-bold text-white">
                            CHRONOS<span className="text-secondary-gold">.</span>
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Exquisite timepieces for the modern connoisseur.
                            Elevating moments into memories.
                        </p>
                    </div>

                    {/* Shop */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Shop</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="/shop" className="hover:text-secondary-gold transition-colors">New Arrivals</Link></li>
                            <li><Link href="/shop" className="hover:text-secondary-gold transition-colors">Best Sellers</Link></li>
                            <li><Link href="/brands" className="hover:text-secondary-gold transition-colors">Brands</Link></li>
                            <li><Link href="/accessories" className="hover:text-secondary-gold transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Support</h4>
                        <ul className="space-y-4 text-gray-400 text-sm">
                            <li><Link href="/contact" className="hover:text-secondary-gold transition-colors">Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-secondary-gold transition-colors">FAQ</Link></li>
                            <li><Link href="/shipping" className="hover:text-secondary-gold transition-colors">Shipping & Returns</Link></li>
                            <li><Link href="/privacy" className="hover:text-secondary-gold transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h4 className="text-white font-semibold mb-6">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <form className="flex">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white/5 border border-white/10 rounded-l-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-secondary-gold w-full"
                            />
                            <button className="bg-secondary-gold text-black px-4 py-2 rounded-r-lg font-medium hover:bg-white transition-colors">
                                Join
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between">
                    <p className="text-gray-500 text-sm">
                        © {new Date().getFullYear()} Chronos. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Twitter className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Facebook className="w-5 h-5" /></a>
                        <a href="#" className="text-gray-400 hover:text-white transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
