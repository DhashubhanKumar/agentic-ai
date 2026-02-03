"use client";

import GlassCard from "@/components/ui/GlassCard";
import { Package, Heart, User, Clock, MapPin, Edit2, Check, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { updateUserAddress } from "@/app/actions/user";

interface DashboardClientProps {
    user: any; // Using any for simplicity in rapid iter, but strictly it matches Prisma User + inclusions
}

export default function DashboardClient({ user }: DashboardClientProps) {
    const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist'>('profile');
    const [isEditingAddress, setIsEditingAddress] = useState(false);
    const [address, setAddress] = useState(user.address || "");
    const [loading, setLoading] = useState(false);

    const handleSaveAddress = async () => {
        setLoading(true);
        const formData = new FormData();
        formData.append("address", address);

        const result = await updateUserAddress(formData);

        if (result.success) {
            setIsEditingAddress(false);
        } else {
            alert("Failed to save address");
        }
        setLoading(false);
    };

    return (
        <div className="flex flex-col md:flex-row gap-12">
            {/* Profile Sidebar */}
            <aside className="w-full md:w-80 space-y-8">
                <GlassCard className="p-8 text-center sticky top-24">
                    <div className="w-24 h-24 mx-auto bg-gray-700 rounded-full mb-4 overflow-hidden">
                        {user.image ? (
                            <img src={user.image} alt="User" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
                                {user.name?.[0] || "U"}
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <p className="text-gray-400 text-sm">{user.email}</p>

                    <div className="mt-8 space-y-2 text-left">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'profile' ? 'text-secondary-gold bg-white/10' : 'text-gray-400 hover:text-white'}`}
                        >
                            <User className="w-5 h-5" /> <span>Profile</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'text-secondary-gold bg-white/10' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Package className="w-5 h-5" /> <span>Orders</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('wishlist')}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'wishlist' ? 'text-secondary-gold bg-white/10' : 'text-gray-400 hover:text-white'}`}
                        >
                            <Heart className="w-5 h-5" /> <span>Wishlist</span>
                        </button>
                    </div>
                </GlassCard>
            </aside>

            {/* Content Area */}
            <main className="flex-1 space-y-8">

                {/* Profile View */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">My Profile</h2>

                        <GlassCard className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-xl font-bold text-white">Shipping Address</h3>
                                {!isEditingAddress ? (
                                    <button onClick={() => setIsEditingAddress(true)} className="text-secondary-gold hover:text-white transition-colors">
                                        <Edit2 className="w-5 h-5" />
                                    </button>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button onClick={() => setIsEditingAddress(false)} className="bg-red-500/20 p-2 rounded text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                        <button onClick={handleSaveAddress} disabled={loading} className="bg-green-500/20 p-2 rounded text-green-500">
                                            <Check className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {isEditingAddress ? (
                                <textarea
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white focus:outline-none focus:border-secondary-gold min-h-[100px]"
                                    placeholder="Enter your full shipping address..."
                                />
                            ) : (
                                <div className="flex items-start text-gray-400">
                                    <MapPin className="w-5 h-5 mr-3 mt-1 text-secondary-gold" />
                                    <p className="whitespace-pre-wrap">{user.address || "No address saved. Click edit to add."}</p>
                                </div>
                            )}
                        </GlassCard>

                        <GlassCard className="p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Account Stats</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-white">{user.orders.length}</p>
                                    <p className="text-gray-500 text-sm">Total Orders</p>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <p className="text-3xl font-bold text-secondary-gold">${user.orders.reduce((acc: any, ord: any) => acc + ord.total, 0).toLocaleString()}</p>
                                    <p className="text-gray-500 text-sm">Total Spent</p>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}

                {/* Orders View */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">Order History</h2>
                        {user.orders.length === 0 ? (
                            <div className="text-gray-400 text-center py-10">
                                No orders found. <Link href="/shop" className="text-secondary-gold underline">Start shopping</Link>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {user.orders.map((order: any) => (
                                    <GlassCard key={order.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="p-3 bg-white/5 rounded-full text-secondary-gold">
                                                <Clock className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{order.id.substring(0, 8)}...</h3>
                                                <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="text-right">
                                                <span className="block text-gray-400 text-xs uppercase tracking-wider">Status</span>
                                                <span className={`font-medium ${order.status === 'Delivered' ? 'text-green-400' : 'text-blue-400'}`}>{order.status}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="block text-gray-400 text-xs uppercase tracking-wider">Total</span>
                                                <span className="text-white font-bold">${order.total.toLocaleString()}</span>
                                            </div>
                                            <Link
                                                href={`/dashboard/orders/${order.id}`}
                                                className="px-4 py-2 border border-white/20 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'wishlist' && (
                    <div className="space-y-6">
                        <h2 className="text-3xl font-bold text-white">My Wishlist</h2>
                        {user.wishlist.length === 0 ? (
                            <div className="text-center py-20 text-gray-400">
                                <Heart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <p>Your wishlist is currently empty.</p>
                                <Link href="/shop" className="text-secondary-gold underline mt-2 block">Browse Collection</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {user.wishlist.map((item: any) => (
                                    <GlassCard key={item.id} className="p-6 flex items-center space-x-4">
                                        <div className="w-24 h-24 bg-white/5 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.watch.images && JSON.parse(item.watch.images as string)?.[0] ? (
                                                <img
                                                    src={JSON.parse(item.watch.images as string)[0]}
                                                    alt={item.watch.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                                                    <Clock className="w-8 h-8 opacity-50" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white">{item.watch.name}</h3>
                                            <p className="text-secondary-gold font-medium">${item.watch.price.toLocaleString()}</p>
                                            <Link
                                                href={`/shop`} // Since product page slug might be tricky without checking routes, link to shop or specific product
                                                className="mt-2 inline-block text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                View Product
                                            </Link>
                                        </div>
                                    </GlassCard>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    );
}
