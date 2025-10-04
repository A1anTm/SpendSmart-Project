'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';

    // Interfaces para los tipos de datos
    interface SavingsGoal {
    _id: string;
    name: string;
    description: string;
    target_amount: number;
    current_amount: number;
    due_date: string;
    status: string;
    progress: number;
    monthly_quota: number;
    }

    interface CreateGoalForm {
    name: string;
    description: string;
    target_amount: number;
    due_date: string;
    }

    export default function SavingsGoalsPage() {
    // Estado para las metas de ahorro
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Estado para el modal de crear meta
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateGoalForm>({
        name: '',
        description: '',
        target_amount: 0,
        due_date: '',
    });
    
    // Estado para el modal de agregar dinero
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
    const [selectedGoalId, setSelectedGoalId] = useState<string>('');
    const [selectedGoalName, setSelectedGoalName] = useState<string>('');
    const [addMoneyAmount, setAddMoneyAmount] = useState<number>(0);
    
    // Estado para mostrar notificaciones
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });

    // Función helper para obtener el token
    const getToken = () => localStorage.getItem('token');

    // Cargar metas de ahorro al iniciar
    useEffect(() => {
        fetchGoals();
    }, []);

    // Función para obtener todas las metas de ahorro
    const fetchGoals = async () => {
        try {
        setLoading(true);
        const token = getToken();
        const response = await axios.get('http://localhost:3002/api/savings', {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        setGoals(response.data.goals);
        } catch (error) {
        console.error('Error al obtener las metas de ahorro:', error);
        showNotification('Error al cargar las metas de ahorro', 'error');
        } finally {
        setLoading(false);
        }
    };

    // Función para crear una nueva meta de ahorro
    const createGoal = async () => {
        try {
        const token = getToken();
        await axios.post('http://localhost:3002/api/savings', createForm, {
            headers: {
            Authorization: `Bearer ${token}`
            }
        });
        setShowCreateModal(false);
        resetCreateForm();
        showNotification('Meta de ahorro creada exitosamente', 'success');
        fetchGoals(); // Refrescar la lista de metas
        } catch (error) {
        console.error('Error al crear la meta de ahorro:', error);
        showNotification('Error al crear la meta de ahorro', 'error');
        }
    };

    // Función para agregar dinero a una meta
    const addMoney = async () => {
        try {
        const token = getToken();
        await axios.patch(
            `http://localhost:3002/api/savings/${selectedGoalId}/add-money`, 
            { amount: addMoneyAmount },
            {
            headers: {
                Authorization: `Bearer ${token}`
            }
            }
        );
        
        setShowAddMoneyModal(false);
        setAddMoneyAmount(0);
        setSelectedGoalId('');
        showNotification('Dinero abonado exitosamente', 'success');
        fetchGoals(); // Refrescar la lista de metas
        } catch (error) {
        console.error('Error al agregar dinero:', error);
        showNotification('Error al abonar dinero', 'error');
        }
    };

    // Función para mostrar notificaciones
    const showNotification = (message: string, type: string) => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
        setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Resetear formulario de crear meta
    const resetCreateForm = () => {
        setCreateForm({
        name: '',
        description: '',
        target_amount: 0,
        due_date: '',
        });
    };

    // Handler para abrir el modal de agregar dinero
    const handleOpenAddMoneyModal = (goalId: string, goalName: string) => {
        setSelectedGoalId(goalId);
        setSelectedGoalName(goalName);
        setShowAddMoneyModal(true);
    };

    // Calcular días restantes
    const calculateRemainingDays = (dueDate: string) => {
        const today = new Date();
        const due = new Date(dueDate);
        const diffTime = due.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
            <div>
            <h1 className="text-xl font-semibold text-gray-800">Metas de Ahorro</h1>
            <p className="text-sm text-gray-600">Establece y alcanza tus objetivos financieros</p>
            </div>
            <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-purple-500 text-white px-4 py-2 rounded-md text-sm flex items-center gap-2 hover:bg-purple-600"
            >
            <span>+</span>
            Nueva Meta
            </button>
        </div>

        {/* Goals Grid */}
        {loading ? (
            <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
                <div key={goal._id} className="bg-white rounded-lg p-4 border border-gray-200">
                {/* Goal Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg">
                        <span className="text-purple-600">✈️</span>
                    </div>
                    <div>
                        <h3 className="font-medium">{goal.name}</h3>
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
                    <span>{goal.progress.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                        className="h-full bg-teal-600 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                    ></div>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                    <span>${goal.current_amount}</span>
                    <span>${goal.target_amount}</span>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-sm text-gray-600">Días restantes</span>
                    {calculateRemainingDays(goal.due_date) <= 0 ? (
                        <span className="block font-medium text-red-500">Vencida</span>
                    ) : (
                        <span className="block font-medium">{calculateRemainingDays(goal.due_date)} días</span>
                    )}
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                    <span className="block text-sm text-gray-600">Mensual requerido</span>
                    <span className="block font-medium text-green-600">${goal.monthly_quota.toFixed(2)}</span>
                    </div>
                </div>

                {/* Add Money Button */}
                <button 
                    onClick={() => handleOpenAddMoneyModal(goal._id, goal.name)}
                    className="w-full border border-gray-200 rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                    + Agregar Dinero
                </button>
                </div>
            ))}
            </div>
        )}

        {/* Create Goal Modal */}
        {showCreateModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Crear nueva meta de ahorro</h2>
                
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título de la meta
                </label>
                <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ej. Viaje a Japón"
                />
                </div>
                
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto objetivo
                </label>
                <input
                    type="number"
                    value={createForm.target_amount}
                    onChange={(e) => setCreateForm({...createForm, target_amount: parseFloat(e.target.value)})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ej. 1000"
                />
                </div>
                
                <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha límite
                </label>
                <input
                    type="date"
                    value={createForm.due_date}
                    onChange={(e) => setCreateForm({...createForm, due_date: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                />
                </div>
                
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                </label>
                <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Describe el propósito de tu meta de ahorro"
                    rows={3}
                ></textarea>
                </div>
                
                <div className="flex justify-end gap-2">
                <button
                    onClick={() => {
                    setShowCreateModal(false);
                    resetCreateForm();
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md"
                >
                    Cancelar
                </button>
                <button
                    onClick={createGoal}
                    className="px-4 py-2 text-sm text-white rounded-md"
                    style={{
                    background: 'linear-gradient(to right, #4ade80, #38bdf8)'
                    }}
                >
                    Crear Meta
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Add Money Modal */}
        {showAddMoneyModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-semibold mb-4">Agregar dinero a tu meta</h2>
                <p className="text-gray-600 mb-4">{selectedGoalName}</p>
                
                <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monto a abonar
                </label>
                <input
                    type="number"
                    value={addMoneyAmount}
                    onChange={(e) => setAddMoneyAmount(parseFloat(e.target.value))}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Ej. 100"
                />
                </div>
                
                <div className="flex justify-end gap-2">
                <button
                    onClick={() => {
                    setShowAddMoneyModal(false);
                    setAddMoneyAmount(0);
                    }}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md"
                >
                    Cancelar
                </button>
                <button
                    onClick={addMoney}
                    className="px-4 py-2 text-sm text-white rounded-md"
                    style={{
                    background: 'linear-gradient(to right, #4ade80, #38bdf8)'
                    }}
                >
                    Abonar
                </button>
                </div>
            </div>
            </div>
        )}

        {/* Notification */}
        {notification.show && (
            <div className="fixed bottom-4 left-4 p-4 rounded-md shadow-md z-50"
            style={{
                backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444',
                color: 'white',
            }}
            >
            {notification.message}
            </div>
        )}
        </div>
    );
    }