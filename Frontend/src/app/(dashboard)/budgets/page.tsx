'use client';
import { useState, useEffect } from 'react';

interface Category {
  _id: string;
  name: string;
}

interface Budget {
  _id: string;
  category: string;
  month: string;
  limit: number;
  threshold: number;
  isActive: boolean;
  spent: number;
  available: number;
  percentUsed: number;
  alert: boolean;
}

export default function BudgetControlPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    category_id: '',
    month: new Date().toISOString().substring(0, 7), // Formato YYYY-MM
    limit: '',
    threshold: '80',
  });

  // Función para obtener el token de autenticación
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener token
        const token = getToken();
        if (!token) {
          setError('No se encontró token de autenticación');
          setLoading(false);
          return;
        }

        // Cargar categorías
        const categoriesResponse = await fetch('http://localhost:3002/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ type: 'gasto' })
        });

        if (!categoriesResponse.ok) {
          throw new Error('Error al cargar categorías');
        }

        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories);

        // Cargar presupuestos
        const budgetsResponse = await fetch('http://localhost:3002/api/budgets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!budgetsResponse.ok) {
          throw new Error('Error al cargar presupuestos');
        }

        const budgetsData = await budgetsResponse.json();
        setBudgets(budgetsData.budgets);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Error al cargar datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación del umbral
    const threshold = parseInt(form.threshold);
    if (isNaN(threshold) || threshold <= 0 || threshold > 100) {
      alert('El umbral de alerta debe ser un número entre 1 y 100');
      return;
    }
    
    try {
      setFormLoading(true);
      setError(null);
      
      const token = getToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }
      
      const response = await fetch('http://localhost:3002/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category_id: form.category_id,
          month: form.month,
          limit: parseFloat(form.limit),
          threshold: threshold
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al crear presupuesto');
      }
      
      // Recargar la lista de presupuestos
      const budgetsResponse = await fetch('http://localhost:3002/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!budgetsResponse.ok) {
        throw new Error('Error al recargar presupuestos');
      }
      
      const budgetsData = await budgetsResponse.json();
      setBudgets(budgetsData.budgets);
      
      // Resetear el formulario
      setForm({
        category_id: '',
        month: new Date().toISOString().substring(0, 7),
        limit: '500.00',
        threshold: '80',
      });
      
      alert('Presupuesto creado correctamente');
    } catch (error) {
      console.error('Error creating budget:', error);
      setError('Error al crear presupuesto');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleBudget = async (id: string) => {
    try {
      const token = getToken();
      if (!token) {
        setError('No se encontró token de autenticación');
        return;
      }
      
      const response = await fetch(`http://localhost:3002/api/budgets/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Error al cambiar estado del presupuesto');
      }
      
      // Recargar la lista de presupuestos
      const budgetsResponse = await fetch('http://localhost:3002/api/budgets', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!budgetsResponse.ok) {
        throw new Error('Error al recargar presupuestos');
      }
      
      const budgetsData = await budgetsResponse.json();
      setBudgets(budgetsData.budgets);
      
    } catch (error) {
      console.error('Error toggling budget:', error);
      setError('Error al cambiar estado del presupuesto');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este presupuesto?')) {
      try {
        const token = getToken();
        if (!token) {
          setError('No se encontró token de autenticación');
          return;
        }
        
        const response = await fetch(`http://localhost:3002/api/budgets/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Error al eliminar presupuesto');
        }
        
        // Recargar la lista de presupuestos
        const budgetsResponse = await fetch('http://localhost:3002/api/budgets', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!budgetsResponse.ok) {
          throw new Error('Error al recargar presupuestos');
        }
        
        const budgetsData = await budgetsResponse.json();
        setBudgets(budgetsData.budgets);
        
        alert('Presupuesto eliminado correctamente');
      } catch (error) {
        console.error('Error deleting budget:', error);
        setError('Error al eliminar presupuesto');
      }
    }
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
          {error && <p className="text-red-500 mt-2">{error}</p>}
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

          {loading ? (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-2 text-gray-600">Cargando presupuestos...</p>
            </div>
          ) : budgets.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-600">No tienes presupuestos activos</p>
            </div>
          ) : (
            <div className="space-y-6">
              {budgets.filter(budget => budget.isActive).map((budget) => {
                return (
                  <div key={budget._id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-800">{budget.category}</h3>
                      <span className={`text-sm font-medium ${getStatusColor(budget.percentUsed)}`}>
                        {getStatusText(budget.percentUsed)}
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${getProgressColor(budget.percentUsed)}`}
                        style={{ width: `${Math.min(budget.percentUsed, 100)}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="space-y-1">
                        <div className="text-gray-600">
                          Gastado: <span className="font-medium text-gray-800">${budget.spent.toFixed(2)}</span>
                        </div>
                        <div className="text-emerald-600">
                          Disponible <span className="font-medium">${budget.available.toFixed(2)}</span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="text-gray-600">
                          Límite: <span className="font-medium text-gray-800">${budget.limit.toFixed(2)}</span>
                        </div>
                        <div className="text-gray-500">
                          {budget.percentUsed.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
                  name="category_id"
                  value={form.category_id}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-gray-500"
                  required
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(category => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mes
                </label>
                <input
                  type="month"
                  name="month"
                  value={form.month}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
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
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Umbral de Alerta (%)
                </label>
                <input
                  type="number"
                  name="threshold"
                  value={form.threshold}
                  onChange={handleFormChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={formLoading}
                className={`w-full ${formLoading ? 'bg-gray-400' : 'bg-emerald-500 hover:bg-emerald-600'} text-white py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors`}
              >
                {formLoading ? 'Creando...' : 'Crear Presupuesto'}
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

            {loading ? (
              <div className="text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                <p className="mt-2 text-gray-600">Cargando presupuestos...</p>
              </div>
            ) : budgets.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-600">No tienes presupuestos configurados</p>
              </div>
            ) : (
              <div className="space-y-4">
                {budgets.map((budget) => (
                  <div key={budget._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={budget.isActive}
                          onChange={() => handleToggleBudget(budget._id)}
                          className="sr-only"
                        />
                        <div
                          className={`relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors ${
                            budget.isActive ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                          onClick={() => handleToggleBudget(budget._id)}
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
                          Límite: ${budget.limit.toFixed(2)} | Alerta: {budget.threshold}% | {budget.month}
                        </p>
                      </div>
                    </div>
                    <button 
                      className="p-1 text-gray-400 hover:text-gray-600"
                      onClick={() => handleDeleteBudget(budget._id)}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}