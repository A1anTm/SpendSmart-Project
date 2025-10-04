'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

/* ---------- TIPOS ---------- */
type ClosestGoalComplete = {
    _id: string;
    name: string;
    description: string;
    due_date: string;
    progress: number;
    target_amount: number;
    current_amount: number;
};

type ClosestGoalEmpty = {
    name: 'Sin metas activas';
};

type ClosestGoal = ClosestGoalComplete | ClosestGoalEmpty;

type Summary = {
    totalBalance: number;
    monthlyIncome: number;
    monthlyExpense: number;
    monthlySavings: number;
    totalSaved: number;
    recentTransactions: any[];
    closestGoal: ClosestGoal;
};

type StatType = 'total' | 'income' | 'expense' | 'savings';

// Función auxiliar para verificar el tipo de meta
function isCompleteGoal(goal: ClosestGoal): goal is ClosestGoalComplete {
    return goal.name !== 'Sin metas activas';
}

/* ---------- COMPONENTE ---------- */
export default function DashboardPage() {
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
        router.push('/login');
        return;
    }

    // Mes actual → "2025-10" (u otro mes si lo deseas)
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 porque enero = 0
    const currentMonth = `${year}-${month}`;

    api
        .get(`/summary?month=${currentMonth}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        .then((res) => {
            setSummary(res.data);
            setLoading(false);
        })
        .catch(() => {
            localStorage.removeItem('token');
            router.push('/login');
        });
    }, [router]);

    if (loading)
        return (
            <div className="p-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                        ))}
                    </div>
                </div>
            </div>
        );

    /* ---------- HELPERS ---------- */
    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(amount);

    const expensePercentage =
        summary && summary.totalBalance > 0
            ? Math.min((summary.monthlyExpense / summary.totalBalance) * 100, 100)
            : 0;

    /* ---------- COMPONENTES ---------- */
    function StatCard({ title, value, trend, type, percentage }: {
        title: string;
        value: string;
        trend?: string;
        type: StatType;
        percentage?: number;
    }) {
        const styles: Record<StatType, string> = {
            total: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
            income: 'bg-emerald-50 border border-emerald-200 text-emerald-700',
            expense: 'bg-rose-50 border border-rose-200 text-rose-700',
            savings: 'bg-blue-50 border border-blue-200 text-blue-700',
        };

        return (
            <div className={`rounded-xl p-6 ${styles[type] || 'bg-white border border-gray-200'}`}>
                <div className="flex items-center justify-between mb-2">
                    <p className={`text-sm font-medium ${type === 'total' ? 'text-emerald-100' : 'text-gray-600'}`}>{title}</p>
                    {type === 'expense' && percentage !== undefined && (
                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">{percentage.toFixed(0)}% del saldo</span>
                    )}
                </div>
                <p className={`text-3xl font-bold mb-1 ${type === 'total' ? 'text-white' : styles[type]?.split(' ')[1]}`}>{value}</p>
                {trend && <p className={`text-xs ${type === 'total' ? 'text-emerald-100' : 'text-gray-500'}`}>{trend}</p>}
                {type === 'savings' && percentage !== undefined && (
                    <p className={`text-xs text-blue-600 font-medium`}>{percentage.toFixed(0)}% del mes</p>
                )}
            </div>
        );
    }

    function QuickActions() {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <span className="text-emerald-500">⚡</span> Acciones Rápidas
                </h3>
                <div className="space-y-3">
                    <button
                        onClick={() => (window.location.href = '/transactions')}
                        className="w-full bg-emerald-500 text-white px-4 py-3 rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                    >
                        + Agregar Transacción
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => (window.location.href = '/expenses')}
                            className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                            Ver Gastos
                        </button>
                        <button
                            onClick={() => (window.location.href = '/budgets')}
                            className="bg-gray-50 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
                        >
                            Presupuesto
                        </button>
                    </div>
                    <button
                        onClick={() => (window.location.href = '/savings')}
                        className="w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                        Metas de Ahorro
                    </button>
                </div>
            </div>
        );
    }

    function SavingsGoal() {
        if (!summary) return null;
        const goal = summary.closestGoal;

        // Caso: sin metas activas
        if (goal.name === 'Sin metas activas') {
            return (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-blue-500">🎯</span> Meta de Ahorro
                    </h3>
                    <p className="text-gray-500 text-sm mt-4">No tienes metas activas. Crea una nueva meta para comenzar a ahorrar.</p>
                    <button
                        onClick={() => (window.location.href = '/savings')}
                        className="mt-4 w-full bg-blue-50 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm"
                    >
                        Crear Meta
                    </button>
                </div>
            );
        }

        if (isCompleteGoal(goal)) {
            const percentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            const missing = goal.target_amount - goal.current_amount;

            return (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-blue-500">🎯</span> Meta de Ahorro
                        </h3>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{percentage.toFixed(0)}%</span>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">{goal.name}</p>
                        <p className="text-xs text-gray-500 mb-2">{goal.description}</p>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl font-bold text-gray-800">{formatCurrency(goal.current_amount)}</span>
                            <span className="text-sm text-gray-500">de {formatCurrency(goal.target_amount)}</span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            ></div>
                        </div>

                        <p className="text-xs text-blue-600 font-medium">
                            {percentage >= 100 ? '¡Meta alcanzada! 🎉' : `Faltan ${formatCurrency(missing)} para alcanzar tu meta`}
                        </p>
                    </div>
                </div>
            );
        }

        // Nunca deberíamos llegar aquí, pero TypeScript requiere que manejes todos los casos
        return null;
    }

    function RecentActivity() {
        const transactions = summary?.recentTransactions?.slice(0, 3) || [];

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
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.type === 'ingreso' ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                                    <span className="text-sm">{tx.type === 'ingreso' ? '💰' : '📄'}</span>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">{tx.description || tx.name}</p>
                                    <p className="text-xs text-gray-500"> {tx.category || (tx.type === 'ingreso' ? 'Ingreso' : 'Gasto')} • {new Date(tx.createdAt).toLocaleDateString('es-ES')}</p>
                                </div>
                            </div>
                            <p className={`font-bold text-sm ${tx.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {tx.type === 'ingreso' ? '+' : '-'}{formatCurrency(tx.amount)}
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Bienvenido de vuelta</h1>
                <p className="text-gray-600 flex items-center gap-2">
                    Tu resumen financiero
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </p>
            </div>

            {/* Saldo Total - Card Principal */}
            <div className="mb-8">
                <StatCard title="Saldo Total" value={formatCurrency(summary?.totalBalance ?? 0)} trend="+2.5% vs mes anterior" type="total" />
            </div>

            {/* Grid de estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard title="Ingresos del Mes" value={formatCurrency(summary?.monthlyIncome ?? 0)} trend="Estable" type="income" />
                <StatCard title="Gastos del Mes" value={formatCurrency(summary?.monthlyExpense ?? 0)} type="expense" percentage={expensePercentage} />
                <StatCard title="Ahorros del Mes" value={formatCurrency(summary?.monthlySavings ?? 0)} type="savings" percentage={summary?.monthlyIncome ? (summary.monthlySavings / summary.monthlyIncome) * 100 : 0} />
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