"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

export default function SidebarNav({ closeSidebar }: { closeSidebar?: () => void }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isTablesOpen, setIsTablesOpen] = useState(false);
    const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
    const [isGestionOpen, setIsGestionOpen] = useState(false);

    const TABLES = [
        { id: "tn_orders", name: "Pedidos", icon: "📦" },
        { id: "tn_products", name: "Productos", icon: "🏷️" },
        { id: "tn_customers", name: "Clientes", icon: "👥" },
        { id: "tn_variants", name: "Variantes", icon: "✨" },
        { id: "tn_order_items", name: "Items", icon: "🛒" },
    ];

    const toggleTables = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsTablesOpen(!isTablesOpen);
    };

    const toggleAnalytics = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsAnalyticsOpen(!isAnalyticsOpen);
    };

    const toggleGestion = (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        setIsGestionOpen(!isGestionOpen);
    };

    return (
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 h-fit sticky top-24 flex flex-col gap-8 min-w-[300px]">
            <nav className="flex flex-col gap-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] px-4 mb-2">Menú Principal</p>

                {/* 1. Dashboard */}
                <Link
                    href="/dashboard"
                    onClick={() => closeSidebar?.()}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${pathname === "/dashboard"
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]"
                        : "text-gray-500 hover:bg-gray-50 hover:translate-x-1"
                        }`}
                >
                    <span className="text-2xl">🚀</span>
                    Dashboard
                </Link>

                {/* 2. Informe */}
                <Link
                    href="/dashboard/informe"
                    onClick={() => closeSidebar?.()}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all duration-300 ${pathname === "/dashboard/informe"
                        ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.02]"
                        : "text-gray-500 hover:bg-gray-50 hover:translate-x-1"
                        }`}
                >
                    <span className="text-2xl">📈</span>
                    Informe
                </Link>

                {/* 3. Analytics Section (Accordion) */}
                <div className="flex flex-col gap-1">
                    <button
                        onClick={toggleAnalytics}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all duration-300 ${pathname.startsWith("/dashboard/analytics") || (pathname === "/dashboard/control" && !searchParams.get('table'))
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">⚡</span>
                            Analytics
                        </div>
                        <svg className={`w-4 h-4 transition-transform duration-500 ${isAnalyticsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-1 mt-1 px-2 border-l-2 border-blue-50 ml-8 ${isAnalyticsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        <Link
                            href="/dashboard/control"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/control" && !searchParams.get('table')
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Vista General
                        </Link>
                        <Link
                            href="/dashboard/analytics/ventas"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/analytics/ventas"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Ventas
                        </Link>
                        <Link
                            href="/dashboard/analytics/productos"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/analytics/productos"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Productos
                        </Link>
                        <Link
                            href="/dashboard/analytics/clientes"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/analytics/clientes"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Clientes
                        </Link>
                        <Link
                            href="/dashboard/analytics/conversion"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/analytics/conversion"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Conversión
                        </Link>
                        <Link
                            href="/dashboard/analytics/insights"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/analytics/insights"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Insights
                        </Link>
                    </div>
                </div>

                {/* 5. Gestión Section (Accordion) */}
                <div className="flex flex-col gap-1">
                    <button
                        onClick={toggleGestion}
                        className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl font-black transition-all duration-300 ${pathname.startsWith("/dashboard/gestion")
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-500 hover:bg-gray-50"
                            }`}
                    >
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">💰</span>
                            Gestión
                        </div>
                        <svg className={`w-4 h-4 transition-transform duration-500 ${isGestionOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-1 mt-1 px-2 border-l-2 border-blue-50 ml-8 ${isGestionOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                        <Link
                            href="/dashboard/gestion"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/gestion"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Vista General
                        </Link>
                        <Link
                            href="/dashboard/gestion/ingresos"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/gestion/ingresos"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Ingresos
                        </Link>
                        <Link
                            href="/dashboard/gestion/costos"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/gestion/costos"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Costos
                        </Link>
                        <Link
                            href="/dashboard/gestion/rentabilidad"
                            onClick={() => closeSidebar?.()}
                            className={`px-4 py-3 rounded-xl text-sm font-bold transition-all ${pathname === "/dashboard/gestion/rentabilidad"
                                ? "text-blue-600 bg-white shadow-sm"
                                : "text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            Rentabilidad
                        </Link>
                    </div>
                </div>

                {/* 4. Tablas Auxiliares */}
                <div className="flex flex-col gap-2">
                    <div className="px-2">
                        <button
                            onClick={toggleTables}
                            className="w-full flex items-center justify-between px-4 py-4 rounded-2xl font-black transition-all duration-300 group cursor-pointer text-gray-500 hover:bg-gray-50"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl">🗄️</span>
                                <span className="text-base">Tablas auxiliares</span>
                            </div>
                            <svg className={`w-4 h-4 transition-transform duration-500 ${isTablesOpen ? 'rotate-180 text-blue-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        <div className={`overflow-hidden transition-all duration-500 flex flex-col gap-1 mt-2 px-4 border-l-2 border-gray-50 ml-6 ${isTablesOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                            {TABLES.map((table) => (
                                <Link
                                    key={table.id}
                                    href={`/dashboard/control?table=${table.id}`}
                                    onClick={() => closeSidebar?.()}
                                    className={`w-full flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-black transition-all duration-300 ${searchParams.get('table') === table.id
                                        ? "bg-blue-50 text-blue-700 shadow-sm translate-x-1"
                                        : "text-gray-400 hover:bg-gray-50 hover:text-gray-600 hover:translate-x-1"
                                        }`}
                                >
                                    <span className="text-lg">{table.icon}</span>
                                    {table.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
