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
    }

    export default function TransactionsPage() {
    const router = useRouter();

    /* ---------- ESTADO ---------- */
    const [transactions, setTransactions] = useState<Tx[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
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

    const buildBody = () => ({
        type: filters.type,
        ...(filters.categoryName && { categoryName: filters.categoryName }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        page: filters.page,
        limit: filters.limit,
    });

    /* ---------- CARGAR CATEGORÍAS (según tipo activo) ---------- */
    useEffect(() => {
        const t = token();
        if (!t) return;
        api
        .get(`/categories?type=${filters.type}`, { headers: { Authorization: `Bearer ${t}` } })
        .then((res) => setCategories(res.data.categories));
    }, [filters.type]);

    /* ---------- CARGAR TRANSACCIONES (según filtros) ---------- */
    const fetchTransactions = async () => {
        setLoading(true);
        const t = token();
        const { data } = await api.post('/transactions/filter', buildBody(), {
        headers: { Authorization: `Bearer ${t}` },
        });
        setTransactions(data.transactions);
        setTotal(data.total);
        setLoading(false);
    };

    useEffect(() => {
        if (!showForm) fetchTransactions();
    }, [filters, showForm]);

    /* ---------- HANDLERS ---------- */
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters((prev) => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const t = token();
        await api.post(
        '/transactions',
        { ...form, amount: Number(form.amount) },
        { headers: { Authorization: `Bearer ${t}` } }
        );
        fetchTransactions(); // recarga lista
        setForm({ ...form, amount: '', description: '', category_id: '' });
    };

    /* ---------- RENDER ---------- */
    if (loading && !showForm) return <p className="p-6">Cargando...</p>;

        return (
    <div className="min-h-screen bg-gray-50 flex">
        <main className="flex-1 p-6 max-w-5xl mx-auto">
        {/* ------- TÍTULO ------- */}
        <div className="bg-white border-b px-6 py-4 mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Gestión de Gastos</h1>
            <p className="text-sm text-gray-600">Agregar y administrar tus transacciones</p>
            <div className="flex gap-4 mt-4">
            <button
                onClick={() => setShowForm(true)}
                className={`text-sm font-medium ${showForm ? 'text-blue-700' : 'text-blue-600'} hover:text-blue-800`}
            >
                Agregar Transacción
            </button>
            <button
                onClick={() => setShowForm(false)}
                className={`text-sm font-medium ${!showForm ? 'text-blue-700' : 'text-blue-600'} hover:text-blue-800`}
            >
                Ver Transacciones
            </button>
            </div>
        </div>

        {/* ------- FORMULARIO (igual que antes) ------- */}
        {showForm && (
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Nueva Transacción</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* ...campos del form... */}
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
                    {categories.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                    </select>
                </div>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-md font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Agregar Transacción
                </button>
            </form>
            </div>
        )}

        {/* ------- FILTROS SIEMPRE VISIBLES ------- */}
        <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">Filtros y Búsqueda</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Tipo */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select name="type" value={filters.type} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="gasto">Gastos</option>
                <option value="ingreso">Ingresos</option>
                </select>
            </div>

            {/* Categoría */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select name="categoryName" value={filters.categoryName} onChange={handleFilterChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
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
        </div>
        </main>
    </div>
    );
    }