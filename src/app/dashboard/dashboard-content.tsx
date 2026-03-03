"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getTiendaNubeAuthUrl } from "@/lib/tiendanube";

interface DashboardContentProps {
    user: any;
    userInfo: any;
    userLogins: any[];
    tiendaNubeConnection?: any;
}

export default function DashboardContent({ user, userInfo, userLogins, tiendaNubeConnection }: DashboardContentProps) {
    const [activeTab, setActiveTab] = useState("informe");
    const [tiendaNubeUrl, setTiendaNubeUrl] = useState<string | null>(null);
    const [isConnecting, setIsConnecting] = useState(false);
    const searchParams = useSearchParams();
    const tiendaNubeMessage = searchParams.get("tiendanube");

    useEffect(() => {
        // Generate Tienda Nube URL
        const generateUrl = async () => {
            const state = Math.random().toString(36).substring(7);
            const url = getTiendaNubeAuthUrl(state);
            setTiendaNubeUrl(url);
        };
        generateUrl();
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                <span className="text-white font-bold text-sm">A</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">Mi Dashboard</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <a
                                href="/auth/logout"
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 text-sm font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
                            >
                                Cerrar Sesión
                            </a>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Status Messages */}
            {tiendaNubeMessage === "connected" && (
                <div className="bg-green-50 border-b border-green-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-3">
                        <svg className="w-5 h-5 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-green-800 font-medium">¡Tu tienda Tienda Nube se conectó exitosamente!</p>
                    </div>
                </div>
            )}
            {tiendaNubeMessage === "error" && (
                <div className="bg-red-50 border-b border-red-200 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="max-w-7xl mx-auto flex items-center gap-3">
                        <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-800 font-medium">Error al conectar tu tienda. Intenta de nuevo.</p>
                    </div>
                </div>
            )}

            {/* Main Content with Sidebar */}
            <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 h-fit sticky top-24">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Secciones</h2>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab("informe")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                        activeTab === "informe"
                                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    Informe
                                </button>
                                <button
                                    onClick={() => setActiveTab("control")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                                        activeTab === "control"
                                            ? "bg-blue-100 text-blue-700 border-l-4 border-blue-600"
                                            : "text-gray-700 hover:bg-gray-100"
                                    }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    </svg>
                                    Panel de Control
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {activeTab === "informe" && (
                            <section>
                                {/* Welcome Section */}
                                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow mb-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">
                                                ¡Hola, {user.name || user.nickname || "Usuario"}!
                                            </h2>
                                            <p className="text-gray-600 text-lg">Bienvenido a tu panel personal</p>
                                        </div>
                                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                                            {user.picture ? (
                                                <img
                                                    src={user.picture}
                                                    alt={user.name || "User"}
                                                    className="w-16 h-16 rounded-full"
                                                />
                                            ) : (
                                                <svg
                                                    className="w-8 h-8 text-blue-600"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                                    />
                                                </svg>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* User Info Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Email</h3>
                                        <p className="text-lg font-semibold text-gray-900 break-all">{user.email}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Nombre</h3>
                                        <p className="text-lg font-semibold text-gray-900">{user.name || user.nickname || "No disponible"}</p>
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Último acceso</h3>
                                        <p className="text-lg font-semibold text-gray-900">
                                            {userInfo?.last_login
                                                ? new Date(userInfo.last_login).toLocaleDateString("es-ES", {
                                                    year: "numeric",
                                                    month: "long",
                                                    day: "numeric",
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })
                                                : "Hoy"}
                                        </p>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === "control" && (
                            <section>
                                <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Panel de Control</h2>
                                
                                {/* Control Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Profile Settings Card */}
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Configuración de Perfil</h3>
                                                <p className="text-gray-600 text-sm">Actualiza tu información personal</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                                            Editar Perfil
                                        </button>
                                    </div>

                                    {/* Security Settings Card */}
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Seguridad</h3>
                                                <p className="text-gray-600 text-sm">Gestiona tu contraseña y sesiones</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                                            Cambiar Contraseña
                                        </button>
                                    </div>

                                    {/* Notifications Card */}
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Notificaciones</h3>
                                                <p className="text-gray-600 text-sm">Configura tus preferencias de alertas</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                                            Gestionar Notificaciones
                                        </button>
                                    </div>

                                    {/* Data & Privacy Card */}
                                    <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8 hover:shadow-xl transition-shadow">
                                        <div className="flex items-start justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">Datos y Privacidad</h3>
                                                <p className="text-gray-600 text-sm">Descarga o elimina tus datos</p>
                                            </div>
                                            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7.5-3.857A9 9 0 1112 2.155m7.5 0a9 9 0 01-7.5 3.845M9.172 16.172a4 4 0 015.656 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors">
                                            Gestionar Datos
                                        </button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-16 text-center">
                    <Link href="/" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        ← Volver al sitio web
                    </Link>
                </div>
            </main>
        </div>
    );
}
