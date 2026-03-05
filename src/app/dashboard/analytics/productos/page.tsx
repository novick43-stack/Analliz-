"use client";

import { useEffect, useState, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend, Line, ComposedChart, Treemap
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import { Package, Smartphone, Tag, RefreshCcw, LayoutGrid, AlertCircle, TrendingUp, DollarSign, Clock, Activity, Calendar } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function ProductosAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/productos";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching productos analytics:", error);
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
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);
    };

    const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    return (
        <section className="flex flex-col gap-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-4">
                    <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Inteligencia de <span className="text-indigo-600">Producto</span></h2>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest">Inventory & Catalog</span>
                        <p className="text-gray-400 font-bold italic text-sm">Optimización de stock y detección de productos estrella</p>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Top Row: Trend & Period Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-xl">
                                <LayoutGrid />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Productos vendidos por día</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        {loading ? (
                            <div className="w-full h-full flex flex-col gap-4">
                                <div className="flex-1 flex items-end gap-2 px-4">
                                    {[...Array(12)].map((_, i) => (
                                        <Skeleton key={i} className="flex-1" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.productsSoldByDay || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(str) => str ? format(new Date(str), "d/M", { locale: es }) : ""}
                                        axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                        cursor={{ fill: '#f1f5f9', opacity: 0.4 }}
                                    />
                                    <Bar dataKey="count" name="Vendidos" fill="#7ed4d4" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Resumen del Período KPI Grid */}
                <div className="lg:col-span-1 bg-[#f0f9f9] rounded-[2.5rem] p-6 border border-[#e0f2f2] flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-700" />
                        <h3 className="text-sm font-black text-gray-800 uppercase italic">Resumen del período</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { val: Math.round(data?.summary?.totalSold || 0), label: "productos vendidos" },
                            { val: (data?.summary?.soldPerDay || 0).toFixed(0), label: "productos por día" },
                            { val: (data?.summary?.soldPerOrder || 0).toFixed(1), label: "productos por venta" },
                            { val: formatCurrency(data?.summary?.avgPricePerItem), label: "por producto (promedio)", isPrice: true }
                        ].map((kpi, i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col justify-between">
                                {loading ? <Skeleton className="w-12 h-6" /> : <p className={`${kpi.isPrice ? 'text-lg' : 'text-2xl'} font-black text-gray-900 truncate`}>{kpi.val}</p>}
                                <p className="text-[8px] font-bold text-gray-400 uppercase leading-tight mt-1">{kpi.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inventory Health Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        label: "Valor Total Inventario",
                        val: formatCurrency(data?.health?.total_inventory_value),
                        icon: <DollarSign />,
                        color: "emerald",
                        desc: "Capital inmovilizado en stock"
                    },
                    {
                        label: "Días de Inventario",
                        val: `${Math.round(data?.health?.avg_days_inventory || 0)} días`,
                        icon: <Clock />,
                        color: "blue",
                        desc: "Estimación de falta de stock"
                    },
                    {
                        label: "Tasa de Rotación",
                        val: `${((data?.health?.total_stock || 0) > 0 ? (data?.categoryTreemap?.reduce((acc: number, c: any) => acc + Number(c.sold_quantity), 0) / data?.health?.total_stock * 100).toFixed(1) : 0)}%`,
                        icon: <Activity />,
                        color: "indigo",
                        desc: "Ritmo de salida vs stock"
                    }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col gap-6 hover:translate-y-[-4px] transition-all duration-500 group">
                        <div className={`w-16 h-16 rounded-3xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                            {loading ? <Skeleton className="w-32 h-10" /> : <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{kpi.val}</h3>}
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{kpi.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pareto Analysis (Top products contributing to 80% revenue) */}
            <div className="bg-white rounded-[4rem] p-12 border border-gray-100 shadow-2xl relative overflow-hidden group">
                <div className="flex items-center justify-between mb-16 px-4">
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 italic uppercase">Análisis Pareto (Top Skus)</h3>
                        <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Detección de productos que generan el 80% de tus ingresos</p>
                    </div>
                </div>

                <div className="h-[500px] w-full">
                    {loading ? <Skeleton className="w-full h-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data?.paretoData || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    hide
                                />
                                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#8b5cf6', fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `${v}%`} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
                                    itemStyle={{ fontWeight: 800 }}
                                />
                                <Bar yAxisId="left" dataKey="total_revenue" radius={[12, 12, 0, 0]} barSize={40}>
                                    {(data?.paretoData || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={i < 10 ? '#3b82f6' : '#cbd5e1'} />
                                    ))}
                                </Bar>
                                <Line yAxisId="right" type="monotone" dataKey="cumulative_percentage" stroke="#8b5cf6" strokeWidth={4} dot={{ fill: '#8b5cf6', r: 4 }} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Treemap & Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Stock Treemap */}
                <div className="lg:col-span-2 bg-gray-900 rounded-[4rem] p-12 shadow-2xl text-white overflow-hidden relative">
                    <div className="flex items-center gap-6 mb-12 relative z-10">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">
                            <LayoutGrid />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black italic uppercase">Distribución de Stock</h3>
                            <p className="text-blue-300 font-bold text-sm uppercase tracking-widest">Tamaño por valor de inventario</p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full relative z-10">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <Treemap
                                    data={data?.categoryTreemap || []}
                                    dataKey="value"
                                    stroke="#111827"
                                    fill="#3b82f6"
                                >
                                    <Tooltip
                                        contentStyle={{ background: '#111827', border: 'none', borderRadius: '16px' }}
                                        formatter={(v: any) => formatCurrency(v)}
                                    />
                                </Treemap>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Stock-out Alerts */}
                <div className="bg-rose-600 rounded-[4rem] p-12 shadow-2xl text-white flex flex-col">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-white/20 flex items-center justify-center text-3xl">
                            <AlertCircle />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase">Riesgo Quiebre</h3>
                            <p className="text-rose-200 font-bold text-[10px] uppercase tracking-widest mt-2">Productos que se agotan en &lt; 7 días</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 flex-1">
                        {loading ? <Skeleton className="w-full h-32 rounded-3xl" /> : (
                            data?.alerts?.length > 0 ? (
                                data.alerts.map((alert: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2 p-6 rounded-3xl bg-white/10 border border-white/10">
                                        <span className="text-xs font-black uppercase truncate">{alert.name}</span>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-2xl font-black">{Math.round(alert.days_left)}</p>
                                                <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">días restantes</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs font-bold">{alert.stock} unidades</p>
                                                <p className="text-[10px] font-bold text-rose-200 uppercase tracking-widest">Stock actual</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center opacity-50">
                                    <Package className="w-16 h-16 mb-4" />
                                    <p className="text-sm font-black uppercase italic">Todo bajo control</p>
                                </div>
                            )
                        )}
                    </div>

                    <button className="mt-8 w-full py-6 rounded-[2rem] bg-white text-rose-600 font-black uppercase tracking-widest text-xs hover:bg-rose-50 transition-colors">
                        Ver sugerencia de compra
                    </button>
                </div>
            </div>
        </section>
    );
}
