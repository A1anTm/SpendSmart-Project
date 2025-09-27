import Sidebar from '@/components/Sidebar';

    export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-gray-50">
        {/* Barra lateral SIEMPRE visible */}
        <Sidebar />
        {/* Aquí se renderiza el contenido de cada página */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
    );
    }