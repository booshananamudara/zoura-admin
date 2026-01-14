'use client';

import { useEffect, useState } from 'react';
import { Plus, Package } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';

interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    images: string[];
    approval_status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.get('http://localhost:8080/products/my-products', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setProducts(response.data);
        } catch (err: any) {
            console.error('Failed to fetch products:', err);
            // For now, use mock data when API is not available
            setError('API not available yet. Showing mock data.');

            // Mock data for demonstration
            setProducts([
                {
                    id: '1',
                    name: 'Premium Coffee Beans',
                    price: 24.99,
                    stock: 150,
                    images: ['https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=100'],
                    approval_status: 'APPROVED',
                },
                {
                    id: '2',
                    name: 'Organic Tea Collection',
                    price: 18.50,
                    stock: 75,
                    images: ['https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=100'],
                    approval_status: 'PENDING',
                },
                {
                    id: '3',
                    name: 'Artisan Chocolate Box',
                    price: 32.00,
                    stock: 0,
                    images: ['https://images.unsplash.com/photo-1511381939415-e44015466834?w=100'],
                    approval_status: 'APPROVED',
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            PENDING: 'bg-yellow-100 text-yellow-800 border border-yellow-300',
            APPROVED: 'bg-green-100 text-green-800 border border-green-300',
            REJECTED: 'bg-red-100 text-red-800 border border-red-300',
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    <p className="mt-4 text-gray-600">Loading products...</p>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Inventory</h1>
                    <p className="text-gray-600 mt-1">Manage your product listings</p>
                </div>
                <Link
                    href="/dashboard/products/new"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="h-5 w-5" />
                    Add Product
                </Link>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">{error}</p>
                </div>
            )}

            {/* Products Table */}
            {products.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 p-12 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="h-8 w-8 text-gray-400" />
                        </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-600 mb-6">
                        Get started by adding your first product to your inventory.
                    </p>
                    <Link
                        href="/dashboard/products/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                        Add Your First Product
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Image
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {products.map((product) => (
                                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="h-12 w-12 rounded-lg overflow-hidden bg-gray-100">
                                                {product.images && product.images[0] ? (
                                                    <img
                                                        src={product.images[0]}
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">${product.price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className={`text-sm font-medium ${product.stock === 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                                {product.stock === 0 ? 'Out of Stock' : `${product.stock} units`}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(product.approval_status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button className="text-blue-600 hover:text-blue-800 font-medium mr-3">
                                                Edit
                                            </button>
                                            <button className="text-red-600 hover:text-red-800 font-medium">
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Showing {products.length} product{products.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
