'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

    const items = [
    { label: 'Resumen', href: '/dashboard', icon: '📊' },
    { label: 'Agregar Transacción', href: '/transactions', icon: '➕' },
    { label: 'Control de Gastos', href: '/budgets', icon: '💳' },
    { label: 'Metas de Ahorro', href: '/savings', icon: '🎯' },
    { label: 'Configuración de Perfil', href: '/profile', icon: '👤' },
    ];

    export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 bg-white h-screen sticky top-0 flex flex-col">
        {/* Header del sidebar */}
        <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
            </div>
            <div>
                <h2 className="text-lg font-bold text-gray-800">SpendSmart</h2>
                <p className="text-xs text-gray-500">Control financiero</p>
            </div>
            </div>
            
            {/* Info del usuario */}
            <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                <span className="text-emerald-600 text-sm font-medium">UD</span>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-800">Usuario Demo</p>
                <p className="text-xs text-gray-500">Bienvenido de vuelta</p>
            </div>
            </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 p-4">
            <ul className="space-y-1">
            {items.map((item) => (
                <li key={item.href}>
                <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                    pathname === item.href
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                    }`}
                >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                </Link>
                </li>
            ))}
            </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
            <button
            onClick={() => {
                localStorage.removeItem('token');
                location.href = '/';
            }}
            className="flex items-center gap-3 w-full px-3 py-2 text-left text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
            <span>🚪</span>
            <span>Cerrar Sesión</span>
            </button>
        </div>
        </aside>
    );
    }