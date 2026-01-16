'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CheckSquare, Users, DollarSign, ShoppingBag, AlertTriangle, Package, TrendingUp, RefreshCw } from 'lucide-react';

interface LowStockItem {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    stock: number;
    productName: string;
    productId: string;
}

interface DashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalVendors: number;
    lowStockItems: LowStockItem[];
}

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('admin_token');
            if (!token) {
                router.push('/admin/login');
                return;
            }

            const response = await fetch('http://localhost:8080/admin/stats', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch stats');
            }

            const data = await response.json();
            setStats(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-400 mb-4">{error}</p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
                    <p className="text-gray-400 mt-1">Overview of your platform</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Cards - Top Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-gradient-to-br from-green-600/20 to-emerald-600/10 rounded-xl shadow-lg p-6 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-green-400">Total Revenue</p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {formatCurrency(stats?.totalRevenue || 0)}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-400" />
                                All time earnings
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-green-500/20 rounded-2xl flex items-center justify-center">
                            <DollarSign className="h-8 w-8 text-green-400" />
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/10 rounded-xl shadow-lg p-6 border border-blue-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-blue-400">Total Orders</p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {stats?.totalOrders || 0}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                <ShoppingBag className="h-4 w-4 text-blue-400" />
                                Orders placed
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-blue-500/20 rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="h-8 w-8 text-blue-400" />
                        </div>
                    </div>
                </div>

                {/* Vendors Card */}
                <div className="bg-gradient-to-br from-purple-600/20 to-violet-600/10 rounded-xl shadow-lg p-6 border border-purple-500/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-purple-400">Total Vendors</p>
                            <p className="text-4xl font-bold text-white mt-2">
                                {stats?.totalVendors || 0}
                            </p>
                            <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                                <Users className="h-4 w-4 text-purple-400" />
                                Registered vendors
                            </p>
                        </div>
                        <div className="h-16 w-16 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                            <Users className="h-8 w-8 text-purple-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alert Panel */}
                <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-400" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
                                <p className="text-sm text-gray-400">Items that need restocking</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-sm font-medium rounded-full">
                            {stats?.lowStockItems?.length || 0} items
                        </span>
                    </div>
                    <div className="p-4">
                        {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                            <div className="space-y-3">
                                {stats.lowStockItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 bg-gray-600 rounded-lg flex items-center justify-center">
                                                <Package className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-white">{item.productName}</p>
                                                <p className="text-sm text-gray-400">
                                                    SKU: {item.sku}
                                                    {item.color && ` • ${item.color}`}
                                                    {item.size && ` • ${item.size}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium ${
                                                item.stock === 0
                                                    ? 'bg-red-500/20 text-red-400'
                                                    : 'bg-amber-500/20 text-amber-400'
                                            }`}>
                                                {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                                <p className="text-gray-400">All items are well stocked!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700">
                    <div className="px-6 py-4 border-b border-gray-700">
                        <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                        <p className="text-sm text-gray-400">Frequently used operations</p>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3">
                        <button
                            onClick={() => router.push('/admin/approvals')}
                            className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <CheckSquare className="h-6 w-6 text-red-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Manage Approvals</h3>
                                <p className="text-sm text-gray-400">Review pending vendors and products</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/admin/vendors')}
                            className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">View All Vendors</h3>
                                <p className="text-sm text-gray-400">Manage registered vendors</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/admin/products')}
                            className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">View All Products</h3>
                                <p className="text-sm text-gray-400">Manage platform products</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
