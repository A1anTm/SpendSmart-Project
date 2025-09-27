'use client';
import { useState } from 'react';

    interface Budget {
    id: string;
    category: string;
    limit: number;
    spent: number;
    alertThreshold: number;
    isActive: boolean;
    }

    export default function BudgetControlPage() {
    const [budgets, setBudgets] = useState<Budget[]>([
        {
        id: '1',
        category: 'Alimentos',
        limit: 500,
        spent: 85.5,
        alertThreshold: 80,
        isActive: true,
        },
        {
        id: '2',
        category: 'Entretenimiento',
        limit: 200,
        spent: 22.98,
        alertThreshold: 75,
        isActive: true,
        },
        {
        id: '3',
        category: 'Comida Fuera',
        limit: 150,
        spent: 0,
        alertThreshold: 70,
        isActive: false,
        },
    ]);

    const [form, setForm] = useState({
        category: '',
        limit: '500.00',
        alertThreshold: '80',
    });

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para crear presupuesto
        console.log('Crear presupuesto:', form);
    };

    const toggleBudget = (id: string) => {
        setBudgets(budgets.map(budget => 
        budget.id === id ? { ...budget, isActive: !budget.isActive } : budget
        ));
    };

    const getProgressColor = (percentage: number) => {
        if (percentage < 50) return 'bg-emerald-500';
        if (percentage < 80) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getStatusText = (percentage: number) => {
        if (percentage < 80) return 'Dentro del presupuesto';
        if (percentage < 100) return 'Cerca del límite';
        return 'Límite excedido';
    };

    const getStatusColor = (percentage: number) => {
        if (percentage < 80) return 'text-emerald-600';
        if (percentage < 100) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Control de Gastos</h1>
            <p className="text-gray-600">Configura límites y recibe alertas sobre tus gastos</p>
            </div>

            {/* Estado de Presupuestos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Estado de Presupuestos</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">Resumen de tus límites de gasto por categoría</p>

            <div className="space-y-6">
                {budgets.filter(budget => budget.isActive).map((budget) => {
                const percentage = (budget.spent / budget.limit) * 100;
                const available = budget.limit - budget.spent;

                return (
                    <div key={budget.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-800">{budget.category}</h3>
                        <span className={`text-sm font-medium ${getStatusColor(percentage)}`}>
                        {getStatusText(percentage)}
                        </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                        className={`h-2 rounded-full ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                        <div className="space-y-1">
                        <div className="text-gray-600">
                            Gastado: <span className="font-medium text-gray-800">${budget.spent}</span>
                        </div>
                        <div className="text-emerald-600">
                            Disponible <span className="font-medium">{available.toFixed(1)}</span>
                        </div>
                        </div>
                        <div className="text-right space-y-1">
                        <div className="text-gray-600">
                            Límite: <span className="font-medium text-gray-800">${budget.limit}</span>
                        </div>
                        <div className="text-gray-500">
                            {percentage.toFixed(1)}%
                        </div>
                        </div>
                    </div>
                    </div>
                );
                })}
            </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agregar Presupuesto */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Agregar Presupuesto</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">Establece un nuevo límite de gasto por categoría</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                    </label>
                    <select
                    name="category"
                    value={form.category}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-500"
                    >
                    <option value="">Selecciona una categoría</option>
                    <option value="transporte">Transporte</option>
                    <option value="salud">Salud</option>
                    <option value="educacion">Educación</option>
                    <option value="ropa">Ropa</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Límite Mensual
                    </label>
                    <input
                    type="number"
                    name="limit"
                    value={form.limit}
                    onChange={handleFormChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Umbral de Alerta (%)
                    </label>
                    <input
                    type="number"
                    name="alertThreshold"
                    value={form.alertThreshold}
                    onChange={handleFormChange}
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-emerald-500 text-white py-3 px-4 rounded-md font-medium hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
                >
                    Crear Presupuesto
                </button>
                </form>
            </div>

            {/* Gestionar Presupuestos */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-800">Gestionar Presupuestos</h2>
                </div>
                <p className="text-sm text-gray-600 mb-6">Activar, desactivar y configurar presupuestos existentes</p>

                <div className="space-y-4">
                {budgets.map((budget) => (
                    <div key={budget.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center">
                        <input
                            type="checkbox"
                            checked={budget.isActive}
                            onChange={() => toggleBudget(budget.id)}
                            className="sr-only"
                        />
                        <div
                            className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                            budget.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                            }`}
                            onClick={() => toggleBudget(budget.id)}
                        >
                            <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                budget.isActive ? 'translate-x-6' : 'translate-x-1'
                            }`}
                            />
                        </div>
                        </div>
                        <div>
                        <h3 className="font-medium text-gray-800">{budget.category}</h3>
                        <p className="text-sm text-gray-600">
                            Límite: ${budget.limit} | Alerta: {budget.alertThreshold}%
                        </p>
                        </div>
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                    </div>
                ))}
                </div>
            </div>
            </div>
        </div>
        </div>
    );
    }