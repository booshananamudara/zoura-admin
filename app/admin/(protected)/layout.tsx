import { ReactNode } from 'react';
import { AdminSidebar } from '@/components/admin/sidebar';
import { RoleGuard } from '@/components/role-guard';

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <RoleGuard allowedRoles={['ADMIN']}>
            <div className="min-h-screen bg-gray-950">
                <AdminSidebar />
                <main className="ml-64">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </RoleGuard>
    );
}
