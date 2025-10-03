'use client';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

/* ---------- TIPOS ---------- */
    interface Tx {
    _id: string;
    type: 'gasto' | 'ingreso';
    amount: number;
    description: string;
    date: string;
    category: string;
    category_id?: string;
    }

    interface Category {
    _id: string;
    name: string;
    appliesTo?: 'gasto' | 'ingreso'; // Añadimos este campo para filtrar en el cliente
    }

    export default function TransactionsPage() {
    const router = useRouter();

    /* ---------- ESTADO ---------- */
    const [transactions, setTransactions] = useState<Tx[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]); // Todas las categorías
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(true); // empieza en formulario

    /* ---------- FORMULARIO NUEVA TRANSACCIÓN ---------- */
    const [form, setForm] = useState({
        type: 'gasto' as 'gasto' | 'ingreso',
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().slice(0, 10),
    });

    /* ---------- FILTROS DE LISTADO ---------- */
    const [filters, setFilters] = useState({
        type: 'gasto' as 'gasto' | 'ingreso',
        categoryName: '',
        startDate: '',
        endDate: '',
        page: 1,
        limit: 20,
    });
    const [total, setTotal] = useState(0);

    /* ---------- HELPERS ---------- */
    const token = () => localStorage.getItem('token');

    // Filtrar categorías según el tipo (para el formulario)
    const formCategories = allCategories.filter(
        cat => !form.type || !cat.appliesTo || cat.appliesTo === form.type
    );

    // Filtrar categorías según el tipo (para los filtros)
    const filterCategories = allCategories.filter(
        cat => !filters.type || !cat.appliesTo || cat.appliesTo === filters.type
    );

    const buildBody = () => ({
        type: filters.type,
        ...(filters.categoryName && { categoryName: filters.categoryName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        page: filters.page,
        limit: filters.limit,
    });

    /* ---------- CARGAR TODAS LAS CATEGORÍAS ---------- */
    useEffect(() => {
        const t = token();
        if (!t) return;

        // Cargar categorías de tipo "gasto"
        const loadGastoCategories = api.post(
        '/categories',
        { type: 'gasto' },
        { headers: { Authorization: `Bearer ${t}` } }
        );

        // Cargar categorías de tipo "ingreso"
        const loadIngresoCategories = api.post(
        '/categories',
        { type: 'ingreso' },
        { headers: { Authorization: `Bearer ${t}` } }
        );

        // Ejecutar ambas peticiones en paralelo
        Promise.all([loadGastoCategories, loadIngresoCategories])
        .then(([gastoRes, ingresoRes]) => {
            // Añadir el atributo appliesTo a cada categoría
            const gastoCategories = gastoRes.data.categories.map((cat: Category) => ({
            ...cat,
            appliesTo: 'gasto' as const
            }));
            
            const ingresoCategories = ingresoRes.data.categories.map((cat: Category) => ({
            ...cat,
            appliesTo: 'ingreso' as const
            }));

            // Combinar ambas listas
            setAllCategories([...gastoCategories, ...ingresoCategories]);
        })
        .catch((err) => console.error('Error al cargar categorías:', err));
    }, []);

    /* ---------- CARGAR TRANSACCIONES (según filtros) ---------- */
    const fetchTransactions = async () => {
        setLoading(true);
        const t = token();
        
        try {
        const { data } = await api.post('/transactions/filter', buildBody(), {
            headers: { Authorization: `Bearer ${t}` },
        });
        
        setTransactions(data.transactions || []);
        setTotal(data.total || 0);
        } catch (error) {
        console.error('Error fetching transactions:', error);
        setTransactions([]);
        setTotal(0);
        } finally {
        setLoading(false);
        }
    };

    // Cargar transacciones cuando cambien los filtros o se muestre la lista
    useEffect(() => {
        if (!showForm) {
        fetchTransactions();
        }
    }, [filters, showForm]);

    /* ---------- HANDLERS ---------- */
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
        setForm(prev => ({ ...prev, type: value as 'gasto' | 'ingreso', category_id: '' }));
    } else {
        setForm(prev => ({ ...prev, [name]: value }));
    }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'type') {
        setFilters(prev => ({ ...prev, type: value as 'gasto' | 'ingreso', categoryName: '', page: 1 }));
    } else {
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const t = token();
        try {
        await api.post(
            '/transactions',
            { ...form, amount: Number(form.amount) },
            { headers: { Authorization: `Bearer ${t}` } }
        );
        setForm({ ...form, amount: '', description: '', category_id: '' });
        // Cambiar a vista de lista y recargar
        setShowForm(false);
        } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Error al agregar la transacción. Inténtalo de nuevo.');
        }
    };

    // Toggle between form and list views
    const toggleView = () => {
        setShowForm(!showForm);
    };

    /* ---------- RENDER ---------- */
    return (
        <div className="min-h-screen bg-gray-50 flex">
        <main className="flex-1 p-6 max-w-5xl mx-auto">
            {/* ------- TÍTULO ------- */}
            <div className="bg-white border-b px-6 py-4 mb-6 flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Gestión de Gastos</h1>
                <p className="text-sm text-gray-600">Agregar y administrar tus transacciones</p>
            </div>
            <button
                onClick={toggleView}
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {showForm ? 'Ver Transacciones' : 'Nueva Transacción'}
            </button>
            </div>

            {/* ------- FORMULARIO (igual que antes) ------- */}
            {showForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Transacción</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select name="type" value={form.type} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="gasto">Gasto</option>
                        <option value="ingreso">Ingreso</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                    <input type="number" step="0.01" name="amount" value={form.amount} onChange={handleFormChange} placeholder="0.00" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                    <input type="text" name="description" value={form.description} onChange={handleFormChange} placeholder="Describe la transacción" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select name="category_id" value={form.category_id} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                        <option value="">Selecciona una categoría</option>
                        {formCategories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                        ))}
                    </select>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                    <input type="date" name="date" value={form.date} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    Agregar Transacción
                </button>
                </form>
            </div>
            )}

            {/* ------- FILTROS Y RESULTADOS (solo visibles cuando showForm es false) ------- */}
            {!showForm && (
            <>
                {/* ------- FILTROS SIEMPRE VISIBLES ------- */}
                <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
                <h3 className="font-medium text-gray-800 mb-3">Filtros y Búsqueda</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                    {/* Tipo */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                    <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todos los tipos</option>
                        <option value="gasto">Gastos</option>
                        <option value="ingreso">Ingresos</option>
                    </select>
                    </div>

                    {/* Categoría */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select name="categoryName" value={filters.categoryName} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las categorías</option>
                        {filterCategories.map((c) => (
                        <option key={c._id} value={c.name}>
                            {c.name}
                        </option>
                        ))}
                    </select>
                    </div>

                    {/* Desde */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Hasta */}
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>

                    {/* Botón Buscar */}
                    <div>
                    <button
                        onClick={fetchTransactions}
                        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Buscar
                    </button>
                    </div>
                </div>
                </div>

                {/* ------- RESULTADOS ------- */}
                <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-medium text-gray-800">Lista de Transacciones</h3>
                    <span className="text-sm text-blue-600">{total} resultado(s)</span>
                </div>

                {loading ? (
                    <div className="p-6 text-center">
                    <p>Cargando...</p>
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                    No se encontraron transacciones con los filtros aplicados.
                    </div>
                ) : (
                    <div className="divide-y">
                    {transactions.map((tx) => (
                        <div key={tx._id} className="flex items-center justify-between p-4 hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center ${tx.type === 'ingreso' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                            <span className={`text-sm ${tx.type === 'ingreso' ? 'text-emerald-600' : 'text-blue-600'}`}>{tx.type === 'ingreso' ? '+' : '-'}</span>
                            </div>
                            <div>
                            <h4 className="font-medium text-gray-800">{tx.description || 'Sin descripción'}</h4>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${tx.type === 'ingreso' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                {tx.type === 'ingreso' ? 'Ingreso' : 'Gasto'}
                                </span>
                                <span>•</span>
                                <span>{tx.category}</span>
                                <span>•</span>
                                <span>{new Date(tx.date).toLocaleDateString()}</span>
                            </div>
                            </div>
                        </div>
                        <span className={`font-semibold ${tx.type === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {tx.type === 'ingreso' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </span>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </>
            )}
        </main>
        </div>
    );
    }