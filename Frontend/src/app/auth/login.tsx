'use client';
import { useState, FormEvent, useEffect } from 'react';
import api from '@/lib/api';

    export const validateLogin = (f: { email: string; password: string }) => {
    const errors: Record<string, string> = {};

    if (!f.email) errors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = 'Formato de correo inválido';

    if (!f.password) errors.password = 'La contraseña es obligatoria';

    return errors;
    };

    interface Props {
    onSuccess: (token: string) => void;
    }

    export default function LoginForm({ onSuccess }: Props) {
    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Validamos el formulario completo cuando cambia algún campo
    useEffect(() => {
        const validationErrors = validateLogin(form);
        setErrors(validationErrors);
        setIsValid(
        Object.keys(validationErrors).length === 0 &&
        Boolean(form.email) &&
        Boolean(form.password)
        );
    }, [form]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setServerError('');
        
        if (!isValid) return;

        try {
        const { data } = await api.post('/users/auth/login', form);
        onSuccess(data.token);
        } catch (err: any) {
        setServerError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* EMAIL */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
            name="email"
            type="email"
            placeholder="tu@email.com"
            value={form.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
            }`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* PASSWORD */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
            }`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

        <button
            type="submit"
            disabled={!isValid}
            className={`w-full py-3 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
            isValid
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
            Iniciar Sesión
        </button>
        </form>
    );
    }