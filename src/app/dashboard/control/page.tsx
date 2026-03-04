"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const TABLES = [
    { id: "tn_orders", name: "Pedidos", icon: "📦" },
    { id: "tn_products", name: "Productos", icon: "🏷️" },
    { id: "tn_customers", name: "Clientes", icon: "👥" },
    { id: "tn_variants", name: "Variantes", icon: "✨" },
    { id: "tn_order_items", name: "Items", icon: "🛒" },
];

export default function ControlPage() {
    const searchParams = useSearchParams();
    const tableId = searchParams.get('table');

    const [isSyncing, setIsSyncing] = useState(false);
    const [tableData, setTableData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const [statusMsg, setStatusMsg] = useState("");

    const handleSync = async () => {
        setIsSyncing(true);
        setStatusMsg("Sincronizando con Tienda Nube...");
        try {
            const res = await fetch("/api/tiendanube/sync", { method: "POST" });
            const data = await res.json();
            if (data.error) throw new Error(data.error);
            setStatusMsg(`¡Éxito! Sincronizados ${data.productsCount} productos, ${data.ordersCount} pedidos, ${data.customersCount} clientes y ${data.categoriesCount} categorías.`);
            if (tableId) fetchTableData(tableId);
        } catch (e: any) {
            setStatusMsg(`Error: ${e.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const fetchTableData = async (table: string) => {
        setIsLoadingData(true);
        try {
            const res = await fetch(`/api/tiendanube/sync?table=${table}`);
            const data = await res.json();
            setTableData(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error("Error fetching table data", e);
        } finally {
            setIsLoadingData(false);
        }
    };

    useEffect(() => {
        if (tableId) {
            fetchTableData(tableId);
        } else {
            setTableData([]);
        }
    }, [tableId]);

    const activeTable = TABLES.find(t => t.id === tableId);

    return (
        <section className="flex flex-col gap-10 pb-10">
            {/* Minimal Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-black text-gray-900 tracking-tight">
                        {tableId ? activeTable?.name : "Vista General"}
                    </h2>
                    <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Analytics Dashboard</p>
                </div>

                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black transition-all shadow-xl active:scale-95 ${isSyncing
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:shadow-blue-200"
                        }`}
                >
                    <svg className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {isSyncing ? "Sincronizando..." : "Sincronizar Datos"}
                </button>
            </div>

            {statusMsg && (
                <div className={`p-4 rounded-2xl text-sm font-bold border animate-in slide-in-from-top duration-300 ${statusMsg.includes('Error') ? 'bg-red-50 border-red-100 text-red-600' : 'bg-green-50 border-green-100 text-green-600'}`}>
                    {statusMsg}
                </div>
            )}

            {/* Content Area */}
            <div className="w-full">
                {tableId ? (
                    <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden flex flex-col min-h-[600px] animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-gray-100 bg-gray-50/30 flex justify-between items-center">
                            <h4 className="font-black text-gray-900 flex items-center gap-3 text-lg">
                                <span className="text-2xl">{activeTable?.icon}</span>
                                {activeTable?.name} (Vista de Tabla)
                            </h4>
                            <div className="px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] uppercase font-black tracking-widest border border-blue-100">
                                DB_NEON_{tableId.toUpperCase()}
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto custom-scrollbar">
                            {isLoadingData ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 text-gray-400 italic py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    Conectando con Neon...
                                </div>
                            ) : tableData.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 text-gray-400 font-black uppercase text-[10px] tracking-widest sticky top-0 bg-white z-10">
                                        <tr>
                                            {Object.keys(tableData[0]).slice(0, 7).map((key) => (
                                                <th key={key} className="px-8 py-5 border-b border-gray-100">{key}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {tableData.map((row, i) => (
                                            <tr key={i} className="hover:bg-blue-50/30 transition-colors group">
                                                {Object.values(row).slice(0, 7).map((val: any, j) => (
                                                    <td key={j} className="px-8 py-5 text-gray-600 font-medium">
                                                        <div className="truncate max-w-[300px]">
                                                            {typeof val === 'object' ? JSON.stringify(val).slice(0, 50) + '...' : String(val)}
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-24 text-gray-400 italic">
                                    <div className="w-24 h-24 rounded-full bg-gray-50 flex items-center justify-center text-4xl opacity-50">
                                        📭
                                    </div>
                                    <p className="font-bold text-lg">No hay datos en esta tabla.</p>
                                    <p className="text-sm max-w-xs text-center">Dale al botón de sincronizar arriba para poblar tus datos.</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                        {/* 1. Ventas Card */}
                        <Link
                            href="/dashboard/analytics/ventas"
                            className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-100 relative z-10">
                                📈
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-gray-900 mb-1.5">Ventas</h3>
                                <p className="text-gray-500 font-medium text-xs leading-relaxed">
                                    Deep dive en facturación, pedidos y ticket promedio. Analiza tus ingresos en detalle.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                                Ver detalle <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                            </div>
                        </Link>

                        {/* 2. Productos Card */}
                        <Link
                            href="/dashboard/analytics/productos"
                            className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                            <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-100 relative z-10">
                                📦
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-gray-900 mb-1.5">Productos</h3>
                                <p className="text-gray-500 font-medium text-xs leading-relaxed">
                                    Descubre tus productos estrella, stock crítico y rendimiento por categorías.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                                Ver detalle <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                            </div>
                        </Link>

                        {/* 3. Clientes Card */}
                        <Link
                            href="/dashboard/analytics/clientes"
                            className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                            <div className="w-14 h-14 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-purple-100 relative z-10">
                                👥
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-black text-gray-900 mb-1.5">Clientes</h3>
                                <p className="text-gray-500 font-medium text-xs leading-relaxed">
                                    Segmentación de audiencia, recurrencia y comportamiento de compra.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 text-purple-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                                Ver detalle <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                            </div>
                        </Link>
                    </div>
                )}
            </div>
        </section>
    );
}
