'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DollarSign, ShoppingBag, Package, AlertTriangle, RefreshCw, Plus, ClipboardList } from 'lucide-react';

interface VendorLowStockItem {
    id: string;
    sku: string;
    color: string | null;
    size: string | null;
    stock: number;
    productName: string;
    productId: string;
}

interface VendorDashboardStats {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    lowStockItems: VendorLowStockItem[];
    shopName: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<VendorDashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/');
                return;
            }

            const response = await fetch('http://localhost:8080/vendors/stats', {
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
            currency: 'LKR',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const getVariantLabel = (item: VendorLowStockItem) => {
        const parts = [];
        if (item.size) parts.push(item.size);
        if (item.color) parts.push(item.color);
        return parts.length > 0 ? parts.join(' / ') : 'Default';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <button
                    onClick={fetchStats}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div>
            {/* Welcome Section */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Welcome back, {stats?.shopName || 'Vendor'}!
                    </h1>
                    <p className="text-gray-600 mt-1">Here's your store overview</p>
                </div>
                <button
                    onClick={fetchStats}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    <RefreshCw className="h-4 w-4" />
                    Refresh
                </button>
            </div>

            {/* Stats Grid - 3 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Revenue Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {formatCurrency(stats?.totalRevenue || 0)}
                            </p>
                            <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                                <DollarSign className="h-4 w-4" />
                                All time earnings
                            </p>
                        </div>
                        <div className="h-14 w-14 bg-green-100 rounded-2xl flex items-center justify-center">
                            <DollarSign className="h-7 w-7 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Orders Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalOrders || 0}
                            </p>
                            <p className="text-sm text-blue-600 mt-2 flex items-center gap-1">
                                <ShoppingBag className="h-4 w-4" />
                                Orders received
                            </p>
                        </div>
                        <div className="h-14 w-14 bg-blue-100 rounded-2xl flex items-center justify-center">
                            <ShoppingBag className="h-7 w-7 text-blue-600" />
                        </div>
                    </div>
                </div>

                {/* Products Card */}
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Live Products</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {stats?.totalProducts || 0}
                            </p>
                            <p className="text-sm text-purple-600 mt-2 flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                Active listings
                            </p>
                        </div>
                        <div className="h-14 w-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                            <Package className="h-7 w-7 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section - Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Low Stock Alerts */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Low Stock Alerts</h2>
                                <p className="text-sm text-gray-500">Items that need restocking</p>
                            </div>
                        </div>
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm font-medium rounded-full">
                            {stats?.lowStockItems?.length || 0} items
                        </span>
                    </div>
                    <div className="p-4">
                        {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                                            <th className="pb-3 font-medium">Item Name</th>
                                            <th className="pb-3 font-medium">Variant</th>
                                            <th className="pb-3 font-medium text-center">Stock</th>
                                            <th className="pb-3 font-medium text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {stats.lowStockItems.map((item) => (
                                            <tr key={item.id} className="text-sm">
                                                <td className="py-3 font-medium text-gray-900">
                                                    {item.productName}
                                                </td>
                                                <td className="py-3 text-gray-600">
                                                    {getVariantLabel(item)}
                                                </td>
                                                <td className="py-3 text-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        item.stock === 0
                                                            ? 'bg-red-100 text-red-800'
                                                            : 'bg-amber-100 text-amber-800'
                                                    }`}>
                                                        {item.stock === 0 ? 'Out of Stock' : `${item.stock} left`}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <button
                                                        onClick={() => router.push(`/dashboard/products/${item.productId}/edit`)}
                                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                    >
                                                        Restock
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">All items are well stocked!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                    <div className="px-6 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                        <p className="text-sm text-gray-500">Frequently used operations</p>
                    </div>
                    <div className="p-4 grid grid-cols-1 gap-3">
                        <button
                            onClick={() => router.push('/dashboard/products/new')}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Plus className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Add Product</h3>
                                <p className="text-sm text-gray-500">Create a new product listing</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/orders')}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <ClipboardList className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">View Orders</h3>
                                <p className="text-sm text-gray-500">Manage your orders</p>
                            </div>
                        </button>

                        <button
                            onClick={() => router.push('/dashboard/products')}
                            className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
                        >
                            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Package className="h-6 w-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Manage Products</h3>
                                <p className="text-sm text-gray-500">View and edit your products</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
