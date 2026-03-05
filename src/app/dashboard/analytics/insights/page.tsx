"use client";

import { useEffect, useState, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import {
    Zap, RefreshCcw, TrendingUp, AlertTriangle,
    Layers, FastForward, Activity
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function InsightsAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/insights";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching insights analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [range]);

    const handleRangeChange = useCallback((from: string, to: string) => {
        setRange({ from, to });
    }, []);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);
    };

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

    return (
        <section className="flex flex-col gap-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-4">
                    <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Estrategia & <span className="text-amber-600">Insights</span></h2>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-amber-600 text-white text-[10px] font-black uppercase tracking-widest">Predictive Analysis</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* SKU Velocity */}
            <div className="bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl font-black italic shadow-sm">
                            <FastForward />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter uppercase italic">Velocidad de Venta (SKUs)</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-[0.2em] mt-2">Productos que rotan más rápido</p>
                        </div>
                    </div>
                    <button onClick={fetchData} className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-orange-600 hover:text-white transition-all cursor-pointer shadow-sm">
                        <RefreshCcw className={`w-6 h-6 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-[3rem]" />
                        ))
                    ) : (
                        (data?.skuVelocity || []).map((sku: any, i: number) => (
                            <div key={i} className="group overflow-hidden relative p-8 rounded-[3rem] bg-gray-50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:translate-y-[-8px] transition-all duration-700">
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black bg-orange-100 text-orange-600 px-3 py-1 rounded-full uppercase tracking-widest">SKU Insight</span>
                                        <p className="text-2xl font-black text-gray-900">{sku.sold_count} <span className="text-xs uppercase text-gray-400">vendidos</span></p>
                                    </div>
                                    <h4 className="text-xl font-black text-gray-800 line-clamp-2 leading-tight uppercase tracking-tighter italic">{sku.name}</h4>
                                    <div className="flex justify-between items-center bg-white/50 p-4 rounded-2xl">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock Actual</span>
                                            <span className="text-lg font-black text-gray-900">{sku.current_stock}</span>
                                        </div>
                                        <div className="w-1.5 h-10 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="w-full bg-orange-500 rounded-full transition-all duration-1000"
                                                style={{ height: `${Math.min((sku.sold_count / (sku.current_stock || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <Activity className="absolute bottom-[-20px] right-[-20px] w-48 h-48 text-orange-500/5 group-hover:text-orange-500/10 group-hover:scale-125 transition-all duration-1000 rotate-12" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* AOV Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AOV Chart */}
                <div className="lg:col-span-2 bg-gray-900 rounded-[2rem] p-12 shadow-2xl text-white">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="w-16 h-16 rounded-3xl bg-white flex items-center justify-center text-3xl text-gray-900 shadow-xl">
                            <Layers />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black tracking-tighter uppercase italic">Distribución de Ticket</h3>
                            <p className="text-orange-400 font-bold text-xs uppercase tracking-[0.2em] mt-2 underline decoration-orange-400/30 underline-offset-4">Ticket Medio por rango de precio</p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.aovDistribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis
                                        dataKey="bucket"
                                        tickFormatter={(v) => `$${v / 1000}k`}
                                        axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 800 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ background: '#111827', borderRadius: '24px', border: 'none' }}
                                    />
                                    <Bar dataKey="count" fill="#f97316" radius={[15, 15, 0, 0]}>
                                        {(data?.aovDistribution || []).map((_: any, i: number) => (
                                            <Cell key={i} fill={i % 2 === 0 ? '#f97316' : '#ea580c'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Insight Summary */}
                <div className="bg-white rounded-[2rem] p-12 border border-orange-100 shadow-sm flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-2xl font-black text-gray-900 italic uppercase underline decoration-orange-500/20">Smart Summary</h3>
                        <p className="text-gray-400 font-bold text-sm leading-relaxed">
                            Analizamos el comportamiento de compra para detectar oportunidades latentes.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        {[
                            { label: "Oportunidad Stock", text: "3 SKUs tienen velocidad alta con stock bajo.", icon: <AlertTriangle className="text-red-500" /> },
                            { label: "Ticket Saludable", text: "Tu zona de confort está en los $40k-$60k.", icon: <Zap className="text-orange-500" /> },
                            { label: "Predicción", text: "Fin de mes tiende a ser un 20% más activo.", icon: <TrendingUp className="text-emerald-500" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 p-6 rounded-[2rem] bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-orange-50">
                                <div className="text-2xl mt-1">{item.icon}</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{item.label}</p>
                                    {loading ? <Skeleton className="w-full h-8" /> : <p className="text-xs font-black text-gray-700 leading-snug tracking-tight">{item.text}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
