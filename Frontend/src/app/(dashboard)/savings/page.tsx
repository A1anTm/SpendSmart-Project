'use client';
import { useState } from 'react';

    export default function SavingsGoalsPage() {
    const [goals, setGoals] = useState([
        {
        id: 1,
        title: 'Vacaciones de Verano',
        description: 'Viaje a la playa',
        currentAmount: 820,
        targetAmount: 1000,
        status: 'Vencida',
        monthlyRequired: 180,
        }
    ]);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-xl font-semibold text-gray-800">Metas de Ahorro</h1>
            <p className="text-sm text-gray-600">Establece y alcanza tus objetivos financieros</p>
            </div>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2">
            <span>+</span>
            Nueva Meta
            </button>
        </div>

        {/* Goals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
            <div key={goal.id} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                <div className="flex gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                    <span className="text-purple-600">✈️</span>
                    </div>
                    <div>
                    <h3 className="font-medium">{goal.title}</h3>
                    <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                </div>
                <button className="text-gray-400">
                    <span>⋮</span>
                </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                    <span>Progreso</span>
                    <span>82.0%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                    className="h-full bg-teal-600 rounded-full" 
                    style={{ width: '82%' }}
                    ></div>
                </div>
                <div className="flex justify-between text-sm mt-1">
                    <span>${goal.currentAmount}</span>
                    <span>${goal.targetAmount}</span>
                </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-sm text-gray-600">Días restantes</span>
                    <span className="block font-medium text-red-500">Vencida</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-sm text-gray-600">Mensual requerido</span>
                    <span className="block font-medium text-green-600">${goal.monthlyRequired}</span>
                </div>
                </div>

                {/* Add Money Button */}
                <button className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                + Agregar Dinero
                </button>
            </div>
            ))}
        </div>
        </div>
    );
    }