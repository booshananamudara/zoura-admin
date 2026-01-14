import { ReactNode } from 'react';
import { Sidebar } from '@/components/sidebar';
import { RoleGuard } from '@/components/role-guard';

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ADMIN', 'VENDOR']}>
            <div className="flex min-h-screen">
                <Sidebar />
                <main className="flex-1 lg:pl-64">
                    <div className="container mx-auto p-6 lg:p-8">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
