'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';

interface RoleGuardProps {
    children: ReactNode;
    allowedRoles: string[];
    fallback?: ReactNode;
}

interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    shop?: string;
    iat?: number;
    exp?: number;
}

export function RoleGuard({ children, allowedRoles, fallback }: RoleGuardProps) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        // Check authentication from localStorage
        // Try admin_token first, then access_token
        const adminToken = localStorage.getItem('admin_token');
        const vendorToken = localStorage.getItem('access_token');
        const token = adminToken || vendorToken;

        if (!token) {
            // No authentication, redirect to appropriate login
            // If checking for ADMIN role, go to admin login, else vendor login
            if (allowedRoles.includes('ADMIN')) {
                router.push('/admin/login');
            } else {
                router.push('/');
            }
            return;
        }

        try {
            // Decode JWT to extract role
            const decoded = jwtDecode<JwtPayload>(token);
            const role = decoded.role;

            if (!role) {
                // Invalid token structure, redirect to login
                if (allowedRoles.includes('ADMIN')) {
                    router.push('/admin/login');
                } else {
                    router.push('/');
                }
                return;
            }

            setUserRole(role);

            // Check if user role is allowed
            if (allowedRoles.includes(role)) {
                setIsAuthorized(true);
            } else {
                setIsAuthorized(false);
            }
        } catch (error) {
            // Invalid token, redirect to login
            console.error('Failed to decode JWT:', error);
            if (adminToken) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
            } else {
                localStorage.removeItem('access_token');
                router.push('/');
            }
        }
    }, [allowedRoles, router]);

    // Loading state
    if (isAuthorized === null) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    // Unauthorized
    if (!isAuthorized) {
        return fallback || (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold">Unauthorized</h2>
                    <p className="text-muted-foreground mt-2">
                        You don't have permission to access this page.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        Your role: <span className="font-semibold">{userRole}</span>
                    </p>
                    <button
                        onClick={() => {
                            localStorage.removeItem('access_token');
                            router.push('/');
                        }}
                        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Authorized
    return <>{children}</>;
}
