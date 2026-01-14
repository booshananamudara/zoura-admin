'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, Loader2 } from 'lucide-react';

interface Vendor {
    id: string;
    email: string;
    name: string;
    shop_name: string;
    approval_status: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    image_url?: string;
    vendor: {
        shop_name: string;
    };
    approval_status: string;
}

export default function ApprovalsPage() {
    const [activeTab, setActiveTab] = useState<'vendors' | 'products'>('products');
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('admin_token');
            const endpoint = activeTab === 'vendors'
                ? 'http://localhost:8080/admin/approvals/vendors'
                : 'http://localhost:8080/admin/approvals/products';

            const response = await axios.get(endpoint, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (activeTab === 'vendors') {
                setVendors(response.data);
            } else {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproveVendor = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(
                `http://localhost:8080/admin/vendors/${id}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove from list
            setVendors(vendors.filter((v) => v.id !== id));
        } catch (error) {
            console.error('Error approving vendor:', error);
            alert('Failed to approve vendor');
        } finally {
            setActionLoading(null);
        }
    };

    const handleApproveProduct = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(
                `http://localhost:8080/admin/products/${id}/approve`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove from list
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Error approving product:', error);
            alert('Failed to approve product');
        } finally {
            setActionLoading(null);
        }
    };

    const handleRejectProduct = async (id: string) => {
        setActionLoading(id);
        try {
            const token = localStorage.getItem('admin_token');
            await axios.patch(
                `http://localhost:8080/admin/products/${id}/reject`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            // Remove from list
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            console.error('Error rejecting product:', error);
            alert('Failed to reject product');
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Pending Approvals</h1>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-gray-700">
                <button
                    onClick={() => setActiveTab('vendors')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'vendors'
                        ? 'text-red-500 border-b-2 border-red-500'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Pending Vendors ({vendors.length})
                </button>
                <button
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-3 font-medium transition-colors ${activeTab === 'products'
                        ? 'text-red-500 border-b-2 border-red-500'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    Pending Products ({products.length})
                </button>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
            ) : activeTab === 'vendors' ? (
                /* Vendors Table */
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {vendors.length === 0 ? (
                        <p className="text-center text-gray-400 py-12">No pending vendors</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Shop Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {vendors.map((vendor) => (
                                    <tr key={vendor.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4 text-sm text-white">{vendor.email}</td>
                                        <td className="px-6 py-4 text-sm text-white">{vendor.name}</td>
                                        <td className="px-6 py-4 text-sm text-white">{vendor.shop_name}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="px-2 py-1 bg-yellow-600/20 text-yellow-500 rounded text-xs">
                                                {vendor.approval_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button
                                                onClick={() => handleApproveVendor(vendor.id)}
                                                disabled={actionLoading === vendor.id}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                            >
                                                {actionLoading === vendor.id ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Check className="w-4 h-4" />
                                                )}
                                                Approve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            ) : (
                /* Products Table */
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {products.length === 0 ? (
                        <p className="text-center text-gray-400 py-12">No pending products</p>
                    ) : (
                        <table className="w-full">
                            <thead className="bg-gray-900">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Image</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Product Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Price</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Shop Name</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-700/50">
                                        <td className="px-6 py-4">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 bg-gray-700 rounded flex items-center justify-center text-gray-500 text-xs">
                                                    No img
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-white">{product.name}</td>
                                        <td className="px-6 py-4 text-sm text-white">₹{product.price}</td>
                                        <td className="px-6 py-4 text-sm text-white">{product.vendor?.shop_name || 'N/A'}</td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleApproveProduct(product.id)}
                                                    disabled={actionLoading === product.id}
                                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleRejectProduct(product.id)}
                                                    disabled={actionLoading === product.id}
                                                    className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {actionLoading === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <X className="w-4 h-4" />
                                                    )}
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
}
