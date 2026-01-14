'use client';

import { useRouter } from 'next/navigation';
import { CheckSquare, Users, Package } from 'lucide-react';

export default function AdminDashboardPage() {
    const router = useRouter();

    return (
        <div>
            <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Pending Approvals</p>
                            <p className="text-2xl font-bold text-white mt-2">View</p>
                        </div>
                        <div className="h-12 w-12 bg-red-600/20 rounded-lg flex items-center justify-center">
                            <CheckSquare className="h-6 w-6 text-red-500" />
                        </div>
                    </div>
                    <button
                        onClick={() => router.push('/admin/approvals')}
                        className="mt-4 text-sm text-red-400 hover:text-red-300"
                    >
                        Go to Approvals →
                    </button>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Vendors</p>
                            <p className="text-2xl font-bold text-white mt-2">-</p>
                        </div>
                        <div className="h-12 w-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-500" />
                        </div>
                    </div>
                </div>

                <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-400">Total Products</p>
                            <p className="text-2xl font-bold text-white mt-2">-</p>
                        </div>
                        <div className="h-12 w-12 bg-green-600/20 rounded-lg flex items-center justify-center">
                            <Package className="h-6 w-6 text-green-500" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => router.push('/admin/approvals')}
                        className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 hover:border-red-500 transition-colors text-left"
                    >
                        <div className="text-red-500 mb-2">
                            <CheckSquare className="h-8 w-8" />
                        </div>
                        <h3 className="font-semibold text-white">Manage Approvals</h3>
                        <p className="text-sm text-gray-400 mt-1">Review pending vendors and products</p>
                    </button>
                </div>
            </div>
        </div>
    );
}
