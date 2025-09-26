'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

    export default function DashboardPage() {
    const [summary, setSummary] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
        router.push('/login');
        return;
        }

        api
        .get('/summary?month=2025-09', { headers: { Authorization: `Bearer ${token}` } })
        .then((res) => {
            setSummary(res.data);
            setLoading(false);
        })
        .catch(() => {
            localStorage.removeItem('token');
            router.push('/login');
        });
    }, [router]);

    if (loading) return (
        <div className="p-6">
        <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
            </div>
        </div>
        </div>
    );

    // Función para formatear moneda
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
        }).format(amount);
    };

    // Componente para las estadísticas principales
    function StatCard({ title, value, trend, type, percentage }: any) {
        const getCardStyles = () => {
        switch (type) {
            case 'total':
            return 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white';
            case 'income':
            return 'bg-emerald-50 border border-emerald-200';
            case 'expense':
            return 'bg-rose-50 border border-rose-200';
            case 'savings':
            return 'bg-blue-50 border border-blue-200';
            default:
            return 'bg-white border border-gray-200';
        }
        };

        const getTextColor = () => {
        switch (type) {
            case 'total':
            return 'text-white';
            case 'income':
            return 'text-emerald-700';
            case 'expense':
            return 'text-rose-700';
            case 'savings':
            return 'text-blue-700';
            default:
            return 'text-gray-700';
        }
        };

        return (
        <div className={`rounded-xl p-6 ${getCardStyles()}`}>
            <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${type === 'total' ? 'text-emerald-100' : 'text-gray-600'}`}>
                {title}
            </p>
            {type === 'expense' && percentage && (
                <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                {percentage}% de presupuesto
                </span>
            )}
            </div>
            <p className={`text-3xl font-bold mb-1 ${getTextColor()}`}>
            {value}
            </p>
            {trend && (
            <p className={`text-xs ${type === 'total' ? 'text-emerald-100' : 'text-gray-500'}`}>
                {trend}
            </p>
            )}
            {type === 'savings' && percentage && (
            <p className={`text-xs text-blue-600 font-medium`}>
                {percentage}% de la meta
            </p>
            )}
        </div>
        );
    }

    // Componente para acciones rápidas
    function QuickActions() {
        return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="text-emerald-500">⚡</span>
            Acciones Rápidas
            </h3>
            <div className="space-y-3">
            <button className="w-full bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
                + Agregar Transacción
            </button>
            <div className="grid grid-cols-2 gap-3">
                <button className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Ver Gastos
                </button>
                <button className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm">
                Presupuesto
                </button>
            </div>
            <button className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                Metas de Ahorro
            </button>
            </div>
        </div>
        );
    }

    // Componente para meta de ahorro
    function SavingsGoal() {
        const goalAmount = 1000;
        const currentAmount = summary.totalSaved || 820;
        const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

        return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <span className="text-blue-500">🎯</span>
                Meta de Ahorro
            </h3>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                {Math.round(percentage)}%
            </span>
            </div>
            
            <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Vacaciones de Verano</p>
            <div className="flex items-center justify-between mb-2">
                <span className="text-2xl font-bold text-gray-800">
                {formatCurrency(currentAmount)}
                </span>
                <span className="text-sm text-gray-500">
                de {formatCurrency(goalAmount)} mensuales
                </span>
            </div>
            
            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
                ></div>
            </div>
            
            <p className="text-xs text-blue-600 font-medium">
                ¡Excelente! Faltan {formatCurrency(goalAmount - currentAmount)} para alcanzar tu meta!
            </p>
            </div>
        </div>
        );
    }

    // Componente para actividad reciente
    function RecentActivity() {
        const transactions = summary.recentTransactions?.slice(0, 3) || [];

        if (transactions.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
            <p className="text-gray-500 text-sm text-center py-8">No hay transacciones recientes</p>
            </div>
        );
        }

        return (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Actividad Reciente</h3>
            <p className="text-xs text-gray-500">Tus últimas transacciones</p>
            </div>
            
            <div className="space-y-4">
            {transactions.map((tx: any) => (
                <div key={tx._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    tx.type === 'ingreso' ? 'bg-emerald-100' : 'bg-gray-100'
                    }`}>
                    <span className="text-sm">
                        {tx.type === 'ingreso' ? '💰' : '📄'}
                    </span>
                    </div>
                    <div>
                    <p className="font-medium text-gray-800 text-sm">
                        {tx.description || tx.name}
                    </p>
                    <p className="text-xs text-gray-500">
                        {tx.category || 'Sin categoría'} • {new Date(tx.date).toLocaleDateString('es-ES')}
                    </p>
                    </div>
                </div>
                <p className={`font-bold text-sm ${
                    tx.type === 'ingreso' ? 'text-emerald-600' : 'text-gray-700'
                }`}>
                    {tx.type === 'ingreso' ? '+' : ''}{formatCurrency(tx.amount)}
                </p>
                </div>
            ))}
            </div>
        </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Bienvenido de vuelta
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
            Tu resumen financiero
            <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                jueves, 25 de septiembre de 2025
            </span>
            </p>
        </div>

        {/* Saldo Total - Card Principal */}
        <div className="mb-8">
            <StatCard
            title="Saldo Total"
            value={formatCurrency(summary.totalBalance)}
            trend="+2.5% vs mes anterior"
            type="total"
            />
        </div>

        {/* Grid de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
            title="Ingresos del Mes"
            value={formatCurrency(summary.monthlyIncome)}
            trend="Estable"
            type="income"
            />
            <StatCard
            title="Gastos del Mes"
            value={formatCurrency(summary.monthlyExpense)}
            type="expense"
            percentage="39"
            />
            <StatCard
            title="Ahorros del Mes"
            value={formatCurrency(summary.monthlySavings)}
            type="savings"
            percentage="61"
            />
        </div>

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <QuickActions />
            <SavingsGoal />
        </div>

        {/* Actividad reciente */}
        <RecentActivity />
        </div>
    );
    }