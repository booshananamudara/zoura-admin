'use client';

import { useRouter } from 'next/navigation';
import { LogOut, User } from 'lucide-react';
import { useState } from 'react';

export function DashboardHeader() {
    const router = useRouter();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        router.push('/');
    };

    return (
        <header className="fixed left-64 right-0 top-0 z-30 h-16 border-b border-gray-200 bg-white">
            <div className="flex h-full items-center justify-between px-8">
                {/* Left side - Title */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-900">Vendor Dashboard</h1>
                </div>

                {/* Right side - User menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowDropdown(!showDropdown)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white">
                            <User className="h-4 w-4" />
                        </div>
                        <span>Vendor</span>
                    </button>

                    {/* Dropdown */}
                    {showDropdown && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowDropdown(false)}
                            />

                            {/* Menu */}
                            <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-20">
                                <div className="p-2">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
