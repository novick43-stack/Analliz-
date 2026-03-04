"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function GestionPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight">Gestión</h2>
                    <p className="text-gray-400 font-bold text-sm mt-1 uppercase tracking-widest">Vista General de Finanzas</p>
                </div>

                <div className="flex gap-4">
                    <button className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <span>📥</span> Reporte PDF
                    </button>
                    <Link href="/dashboard/gestion/costos" className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:shadow-lg hover:shadow-blue-100 transition-all flex items-center gap-2">
                        <span>➕</span> Gestionar Costos
                    </Link>
                </div>
            </div>

            {/* Hub Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                {/* 1. Ingresos Card */}
                <Link
                    href="/dashboard/gestion/ingresos"
                    className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                    <div className="w-14 h-14 rounded-2xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-lg relative z-10">
                        💰
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-gray-900 mb-1.5">Ingresos</h3>
                        <p className="text-gray-500 font-medium text-xs leading-relaxed">
                            Analiza el flujo de caja, ventas netas y métricas de facturación detalladas.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-green-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                        Ver análisis <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                    </div>
                </Link>

                {/* 2. Costos Card */}
                <Link
                    href="/dashboard/gestion/costos"
                    className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                    <div className="w-14 h-14 rounded-2xl bg-red-500 flex items-center justify-center text-white text-2xl shadow-lg relative z-10">
                        📉
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-gray-900 mb-1.5">Costos</h3>
                        <p className="text-gray-500 font-medium text-xs leading-relaxed">
                            Carga y gestiona costos de mercadería, fijos y variables para un cálculo real.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                        Gestionar costos <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                    </div>
                </Link>

                {/* 3. Rentabilidad Card */}
                <Link
                    href="/dashboard/gestion/rentabilidad"
                    className="group relative bg-white rounded-[2rem] p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 flex flex-col gap-5 overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -translate-y-12 translate-x-12 group-hover:scale-150 transition-transform duration-700 opacity-40"></div>

                    <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg relative z-10">
                        💎
                    </div>

                    <div className="relative z-10">
                        <h3 className="text-xl font-black text-gray-900 mb-1.5">Rentabilidad</h3>
                        <p className="text-gray-500 font-medium text-xs leading-relaxed">
                            Visualiza tus márgenes netos y brutos. La verdad sobre la salud de tu negocio.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-auto relative z-10">
                        Ver márgenes <span className="group-hover:translate-x-1.5 transition-transform">→</span>
                    </div>
                </Link>
            </div>

            {/* Summary Preview */}
            <div className="bg-gray-900 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center gap-6 border-4 border-blue-600/20">
                <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/5 rounded-full -translate-y-48 -translate-x-48"></div>
                <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-4xl">🚀</div>
                <div className="relative z-10">
                    <h4 className="text-2xl font-black text-white mb-2">Resumen Financiero Consolidado</h4>
                    <p className="text-blue-300 font-bold italic text-sm max-w-md mx-auto">
                        "En esta sección verás la integración total de tus Ingresos y Costos para darte el veredicto final sobre tu rentabilidad."
                    </p>
                </div>
            </div>
        </section>
    );
}
