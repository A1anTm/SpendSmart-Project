'use client';
import { useState, FormEvent, useEffect } from 'react';
import api from '@/lib/api';

    const validateRegister = (f: {
    fullName: string;
    email: string;
    password: string;
    confirmPassword: string;
    }) => {
    const errors: Record<string, string> = {};

    if (!f.fullName) errors.fullName = 'El nombre es obligatorio';
    else if (f.fullName.length < 3) errors.fullName = 'El nombre debe tener al menos 3 caracteres';
    else if (f.fullName.length > 60) errors.fullName = 'El nombre no puede superar 60 caracteres';
    else if (!/^[a-zA-ZáéíóúüñÑ\s'-]+$/.test(f.fullName))
        errors.fullName = 'El nombre contiene caracteres no válidos';

    if (!f.email) errors.email = 'El correo es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
        errors.email = 'Formato de correo inválido';

    if (!f.password) errors.password = 'La contraseña es obligatoria';
    else if (f.password.length < 8) errors.password = 'La contraseña debe tener al menos 8 caracteres';
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/.test(f.password))
        errors.password = 'Debe incluir mayúscula, minúscula, número y símbolo';

    if (!f.confirmPassword) errors.confirmPassword = 'Debe confirmar la contraseña';
    else if (f.password !== f.confirmPassword) errors.confirmPassword = 'Las contraseñas no coinciden';

    return errors;
    };

    interface Props {
    onSuccess: (token: string) => void;
    }

    export default function RegisterForm({ onSuccess }: Props) {
    const [form, setForm] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Validamos el formulario completo cuando cambia algún campo
    useEffect(() => {
        const validationErrors = validateRegister(form);
        setErrors(validationErrors);
        setIsValid(
        Object.keys(validationErrors).length === 0 &&
        Boolean(form.fullName) &&
        Boolean(form.email) &&
        Boolean(form.password) &&
        Boolean(form.confirmPassword)
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
        const { data } = await api.post('/users/auth/register', {
            full_name: form.fullName,
            email: form.email,
            password: form.password,
        });
        onSuccess(data.token);
        } catch (err: any) {
        const msgs = err.response?.data?.messages || [err.response?.data?.message || 'Error al registrarse'];
        const map: Record<string, string> = {};
        msgs.forEach((m: string) => {
            if (m.includes('nombre')) map.fullName = m;
            else if (m.includes('correo') || m.includes('email')) map.email = m;
            else if (m.includes('contraseña') || m.includes('password')) map.password = m;
        });
        setErrors(map);
        if (!map.fullName && !map.email && !map.password) setServerError(msgs[0]);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* FULLNAME */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
            name="fullName"
            type="text"
            placeholder="Tu nombre"
            value={form.fullName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.fullName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
            }`}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

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

        {/* CONFIRM */}
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
            <input
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 ${
                errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-emerald-500'
            }`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
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
            Crear Cuenta
        </button>
        </form>
    );
    }