"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import SidebarNav from "./sidebar-nav";

export default function DashboardShell({
    children,
    user
}: {
    children: React.ReactNode;
    user: any;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef<HTMLDivElement>(null);

    // Close settings popup when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header / Navigation */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-20 transition-all duration-300">
                <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-12">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-4">
                            {/* Hamburger Button: Circle with 3 lines */}
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 rounded-full bg-blue-50 hover:bg-blue-100 flex items-center justify-center transition-all duration-200 border border-blue-100 group"
                                aria-label="Toggle Sidebar"
                            >
                                <div className="flex flex-col gap-1 w-5 items-center">
                                    <span className={`h-0.5 w-full bg-blue-600 rounded-full transition-all ${isSidebarOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                                    <span className={`h-0.5 w-full bg-blue-600 rounded-full transition-all ${isSidebarOpen ? 'opacity-0' : ''}`}></span>
                                    <span className={`h-0.5 w-full bg-blue-600 rounded-full transition-all ${isSidebarOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                                </div>
                            </button>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-sm">
                                    <span className="text-white font-bold text-sm">A</span>
                                </div>
                                <Link href="/dashboard" className="text-xl font-bold text-gray-800 tracking-tight hover:text-blue-600 transition-colors">
                                    Analliz
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4 relative" ref={settingsRef}>
                                {/* Avatar */}
                                {user.picture && (
                                    <img
                                        src={user.picture}
                                        alt="Avatar"
                                        className="w-9 h-9 rounded-full border-2 border-white shadow-sm"
                                    />
                                )}

                                {/* Settings Cog */}
                                <button
                                    onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                    className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-all duration-200 border border-gray-100 group"
                                >
                                    <svg className={`w-6 h-6 text-gray-600 group-hover:rotate-90 transition-transform duration-500 ${isSettingsOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </button>

                                {/* Settings Popup */}
                                {isSettingsOpen && (
                                    <div className="absolute right-0 top-14 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 animate-in fade-in zoom-in duration-200 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-gray-50 mb-2">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Configuración</p>
                                        </div>
                                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <span>⚙️</span> Ajustes Generales
                                        </Link>
                                        <Link href="/dashboard/plans" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                            <span>💎</span> Elegir Plan
                                        </Link>
                                        <div className="h-px bg-gray-50 my-2"></div>
                                        <a href="/auth/logout" className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                                            <span>🚪</span> Cerrar Sesión
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-full mx-auto py-12 px-4 sm:px-6 lg:px-12 relative">
                <div className="flex gap-8 items-start">
                    {/* Sidebar with Transition */}
                    <aside
                        className={`transition-all duration-500 ease-in-out ${isSidebarOpen
                            ? "w-72 opacity-100 translate-x-0"
                            : "w-0 opacity-0 -translate-x-10 pointer-events-none"
                            } overflow-hidden`}
                    >
                        <SidebarNav closeSidebar={() => setIsSidebarOpen(false)} />
                    </aside>

                    {/* Page Content */}
                    <div className="flex-1 transition-all duration-500">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
