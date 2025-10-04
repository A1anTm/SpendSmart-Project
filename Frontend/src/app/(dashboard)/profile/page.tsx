'use client';
import { useState, useEffect, ChangeEvent, FormEvent, JSX } from 'react';

    // Definición de interfaces para los tipos
    interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    }

    interface SocialAccount {
    provider: string;
    account_url: string;
    }

    interface UserData {
    full_name: string;
    phone_number: string;
    country: string;
    birthdate: string;
    bio: string;
    address: Address;
    social_accounts: SocialAccount[];
    }

    interface PasswordData {
    currentPassword: string;
    newPassword: string;
    }

    interface NotificationProps {
    message: string;
    type: 'error' | 'success';
    }

    // Función para obtener el token
    export const getToken = (): string | null => localStorage.getItem('token');

    export default function ProfileSettingsPage() {
        const [activeTab, setActiveTab] = useState<'perfil' | 'seguridad'>('perfil');
        const [loading, setLoading] = useState<boolean>(true);
        const [saving, setSaving] = useState<boolean>(false);
        const [error, setError] = useState<string>('');
        const [success, setSuccess] = useState<string>('');
        const [userData, setUserData] = useState<UserData>({
            full_name: '',
            phone_number: '',
            country: '',
            birthdate: '',
            bio: '',
            address: {
                street: '',
                city: '',
                state: '',
                zip: ''
            },
            social_accounts: []
        });
        
        // Estado para cambio de contraseña
        const [passwordData, setPasswordData] = useState<PasswordData>({
            currentPassword: '',
            newPassword: ''
        });
        
        // Cargar datos de usuario al montar el componente
        useEffect(() => {
            fetchUserData();
        }, []);
        
        const fetchUserData = async (): Promise<void> => {
            try {
                setLoading(true);
                setError('');
                const token = getToken();
                
                if (!token) {
                    setError('No estás autenticado. Por favor inicia sesión.');
                    return;
                }
                
                const response = await fetch('http://localhost:3002/api/users/', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Error al obtener datos de usuario');
                }
                
                const data = await response.json();
                const { user } = data;
                
                setUserData({
                    full_name: user.full_name || '',
                    phone_number: user.phone_number || '',
                    country: user.country || '',
                    birthdate: user.birthdate ? new Date(user.birthdate).toISOString().split('T')[0] : '',
                    bio: user.bio || '',
                    address: {
                        street: user.address?.street || '',
                        city: user.address?.city || '',
                        state: user.address?.state || '',
                        zip: user.address?.zip || ''
                    },
                    social_accounts: user.social_accounts || []
                });
            } catch (error) {
                console.error('Error fetching user data:', error);
                setError('Error al obtener datos de usuario');
            } finally {
                setLoading(false);
            }
        };
        
        // Manejar cambios en los campos del formulario
        const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
            const { name, value } = e.target;
            
            if (name.startsWith('address.')) {
                const addressField = name.split('.')[1];
                setUserData({
                    ...userData,
                    address: {
                        ...userData.address,
                        [addressField]: value
                    }
                });
            } else {
                setUserData({
                    ...userData,
                    [name]: value
                });
            }
        };
        
        // Manejar cambios en las redes sociales
        const handleSocialAccountChange = (index: number, field: keyof SocialAccount, value: string): void => {
            const updatedAccounts = [...userData.social_accounts];
            updatedAccounts[index] = {
                ...updatedAccounts[index],
                [field]: value
            };
            
            setUserData({
                ...userData,
                social_accounts: updatedAccounts
            });
        };
        
        // Añadir nueva red social
        const addSocialAccount = (): void => {
            setUserData({
                ...userData,
                social_accounts: [
                    ...userData.social_accounts,
                    { provider: '', account_url: '' }
                ]
            });
        };
        
        // Eliminar red social
        const removeSocialAccount = (index: number): void => {
            const updatedAccounts = [...userData.social_accounts];
            updatedAccounts.splice(index, 1);
            
            setUserData({
                ...userData,
                social_accounts: updatedAccounts
            });
        };
        
        // Actualizar perfil
        const updateProfile = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();
            try {
                setSaving(true);
                setError('');
                setSuccess('');
                const token = getToken();
                
                if (!token) {
                    setError('No estás autenticado. Por favor inicia sesión.');
                    return;
                }
                
                const response = await fetch('http://localhost:3002/api/users/', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(userData)
                });
                
                if (!response.ok) {
                    throw new Error('Error al actualizar el perfil');
                }
                
                const data = await response.json();
                setSuccess('Perfil actualizado con éxito');
            } catch (error) {
                console.error('Error updating profile:', error);
                setError('Error al actualizar el perfil');
            } finally {
                setSaving(false);
            }
        };
        
        // Manejar cambios en formulario de contraseña
        const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>): void => {
            const { name, value } = e.target;
            setPasswordData({
                ...passwordData,
                [name]: value
            });
        };
        
        // Cambiar contraseña
        const changePassword = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();
            try {
                setSaving(true);
                setError('');
                setSuccess('');
                const token = getToken();
                
                if (!token) {
                    setError('No estás autenticado. Por favor inicia sesión.');
                    return;
                }
                
                const response = await fetch('http://localhost:3002/api/users/change-password', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(passwordData)
                });
                
                if (!response.ok) {
                    throw new Error('Error al cambiar la contraseña');
                }
                
                const data = await response.json();
                setSuccess('Contraseña actualizada con éxito');
                setPasswordData({
                    currentPassword: '',
                    newPassword: ''
                });
            } catch (error) {
                console.error('Error changing password:', error);
                setError('Error al cambiar la contraseña');
            } finally {
                setSaving(false);
            }
        };
        
        // Obtener iniciales para avatar
        const getUserInitials = (): string => {
            if (!userData.full_name) return 'U';
            return userData.full_name
                .split(' ')
                .map(name => name[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
        };

        // Componente de notificación
        const Notification = ({ message, type }: NotificationProps): JSX.Element | null => {
            if (!message) return null;
            
            return (
                <div className={`p-3 rounded-md mb-4 ${
                    type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                    {message}
                </div>
            );
        };

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
                        type="button"
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
                        type="button"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Seguridad
                    </button>
                </div>

                {/* Profile Content */}
                {activeTab === 'perfil' && (
                    <div className="bg-white rounded-lg border p-6">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Información Personal</h2>
                                <p className="text-sm text-gray-600">Actualiza tu información básica</p>
                            </div>
                            <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                                {getUserInitials()}
                            </div>
                        </div>

                        {/* Mostrar errores o mensajes de éxito */}
                        {error && <Notification message={error} type="error" />}
                        {success && <Notification message={success} type="success" />}

                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                            </div>
                        ) : (
                            <form onSubmit={updateProfile}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={userData.full_name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                                        <input
                                            type="text"
                                            name="phone_number"
                                            value={userData.phone_number}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={userData.country}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            name="birthdate"
                                            value={userData.birthdate}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                        <textarea
                                            name="bio"
                                            value={userData.bio}
                                            onChange={handleInputChange}
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                                        <input
                                            type="text"
                                            name="address.street"
                                            value={userData.address.street}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                                        <input
                                            type="text"
                                            name="address.city"
                                            value={userData.address.city}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado/Provincia</label>
                                        <input
                                            type="text"
                                            name="address.state"
                                            value={userData.address.state}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                                        <input
                                            type="text"
                                            name="address.zip"
                                            value={userData.address.zip}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-md font-semibold text-gray-800 mb-2">Redes Sociales</h3>
                                    {userData.social_accounts.map((account, index) => (
                                        <div key={index} className="flex gap-2 mb-2">
                                            <select
                                                value={account.provider}
                                                onChange={(e) => handleSocialAccountChange(index, 'provider', e.target.value)}
                                                className="w-1/3 px-3 py-2 border border-gray-300 rounded-md"
                                            >
                                                <option value="">Seleccionar red</option>
                                                <option value="twitter">Twitter</option>
                                                <option value="linkedin">LinkedIn</option>
                                                <option value="facebook">Facebook</option>
                                                <option value="instagram">Instagram</option>
                                            </select>
                                            <input
                                                type="url"
                                                value={account.account_url}
                                                onChange={(e) => handleSocialAccountChange(index, 'account_url', e.target.value)}
                                                placeholder="URL del perfil"
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => removeSocialAccount(index)}
                                                className="bg-red-100 text-red-600 p-2 rounded-md hover:bg-red-200"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                    <button 
                                        type="button"
                                        onClick={addSocialAccount}
                                        className="mt-2 text-teal-600 flex items-center gap-1 hover:text-teal-800"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Añadir red social
                                    </button>
                                </div>

                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="mt-6 w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 flex items-center justify-center gap-2"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Pestaña de Seguridad */}
                {activeTab === 'seguridad' && (
                    <div className="bg-white rounded-lg border p-6">
                        <div className="mb-6">
                            <h2 className="text-lg font-semibold text-gray-800">Seguridad de la Cuenta</h2>
                            <p className="text-sm text-gray-600">Actualiza tu contraseña</p>
                        </div>
                        
                        {error && <Notification message={error} type="error" />}
                        {success && <Notification message={success} type="success" />}
                        
                        <form onSubmit={changePassword}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña Actual</label>
                                    <input
                                        type="password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        value={passwordData.newPassword}
                                        onChange={handlePasswordChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                        required
                                    />
                                </div>
                                
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="w-full bg-teal-500 text-white py-2 px-4 rounded-md hover:bg-teal-600 flex items-center justify-center gap-2 mt-4"
                                >
                                    {saving ? (
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Actualizar Contraseña
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        );
    }