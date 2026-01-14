import { ReactNode } from 'react';
import { DashboardSidebar } from '@/components/dashboard/sidebar';
import { DashboardHeader } from '@/components/dashboard/header';
import { RoleGuard } from '@/components/role-guard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['VENDOR']}>
            <div className="min-h-screen bg-gray-50">
                <DashboardSidebar />
                <DashboardHeader />
                <main className="ml-64 pt-16">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
