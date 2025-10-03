'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import LoginForm from './login';
import RegisterForm from './register';

type Mode = 'login' | 'register';

    export default function AuthPage() {
    const [mode, setMode] = useState<Mode>('login');
    const [error, setError] = useState('');
    const router = useRouter();

    /* ---------- Estado separado para cada forma ---------- */
    const [login, setLogin] = useState({ email: '', password: '' });
    const [register, setRegister] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });

    /* ---------- Handlers genéricos ---------- */
    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setLogin({ ...login, [e.target.name]: e.target.value });

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setRegister({ ...register, [e.target.name]: e.target.value });

    /* ---------- Submit ---------- */
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const { data } = await api.post('/users/auth/login', { email: login.email, password: login.password });
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
        } catch (err: any) {
        setError(err.response?.data?.message || 'Error al iniciar sesión');
        }
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (register.password !== register.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
        }
        try {
        const { data } = await api.post('/users/auth/register', {
            full_name: register.fullName,
            email: register.email,
            password: register.password,
        });
        localStorage.setItem('token', data.token);
        router.push('/dashboard');
        } catch (err: any) {
        setError(err.response?.data?.message || 'Error al registrarse');
        }
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Left Side - Features (igual que tenías) */}
        <div className="flex-1 flex flex-col justify-center px-12 py-8">
            <div className="flex items-center mb-8">
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">SpendSmart</h1>
            </div>

            <h2 className="text-4xl font-bold text-gray-800 mb-12 leading-tight">
            Toma el control de tus finanzas personales con inteligencia y simplicidad
            </h2>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-8">
                {/* Feature 1 */}
                <div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Seguimiento en Tiempo Real</h3>
                    <p className="text-gray-600 text-sm">Monitorea tus ingresos y gastos al instante</p>
                </div>

                {/* Feature 2 */}
                <div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Análisis Inteligente</h3>
                    <p className="text-gray-600 text-sm">Obtén insights sobre tus hábitos financieros</p>
                </div>

                {/* Feature 3 */}
                <div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Metas de Ahorro</h3>
                    <p className="text-gray-600 text-sm">Establece y alcanza tus objetivos financieros</p>
                </div>

                {/* Feature 4 */}
                <div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Control de Presupuesto</h3>
                    <p className="text-gray-600 text-sm">Mantén tus gastos bajo control con alertas</p>
                </div>
            </div>
        </div>

        {/* Right Side - Form Box */}
        <div className="w-[600px] flex flex-col justify-center px-8 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">Bienvenido</h2>
            <p className="text-gray-500 text-sm mb-8 text-center">Accede a tu cuenta o crea una nueva para comenzar</p>

            {/* Tabs */}
            <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
                <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    mode === 'login' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Iniciar Sesión
                </button>
                <button
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    mode === 'register' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
                >
                Registrarse
                </button>
            </div>

            {/* Formularios separados */}
            {mode === 'login' ? (
            <LoginForm onSuccess={(token) => { localStorage.setItem('token', token); router.push('/dashboard'); }} />
            ) : (
            <RegisterForm onSuccess={(token) => { localStorage.setItem('token', token); router.push('/dashboard'); }} />
            )}
            </div>
        </div>
        </div>
    );
    }