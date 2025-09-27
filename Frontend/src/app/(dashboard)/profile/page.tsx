'use client';
import { useState } from 'react';

    export default function ProfileSettingsPage() {
    const [activeTab, setActiveTab] = useState('perfil');
    

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Configuración de Perfil</h1>
            <p className="text-sm text-gray-600">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
            <button 
            onClick={() => setActiveTab('perfil')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                activeTab === 'perfil' 
                ? 'bg-white shadow-sm border' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Perfil
            </button>

            <button 
            onClick={() => setActiveTab('seguridad')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                activeTab === 'seguridad' 
                ? 'bg-white shadow-sm border' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Seguridad
            </button>

            <button 
            onClick={() => setActiveTab('preferencias')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                activeTab === 'preferencias' 
                ? 'bg-white shadow-sm border' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Preferencias
            </button>
        </div>

        {/* Profile Content */}
        <div className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-start mb-6">
            <div>
                <h2 className="text-lg font-semibold text-gray-800">Información Personal</h2>
                <p className="text-sm text-gray-600">Actualiza tu información básica</p>
            </div>
            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                UD
            </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                <input
                type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                <input
                type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <input
                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                <input
                type="text"
                
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>

            <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Ocupación</label>
                <input
                type="text"
                
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                readOnly
                />
            </div>
            </div>

            <button className="mt-6 w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar Perfil
            </button>
        </div>
        </div>
    );
    }