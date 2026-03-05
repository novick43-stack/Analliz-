"use client";

import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, BarChart, Bar
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import { Users, UserPlus, Heart, RefreshCcw, Mail, DollarSign, Target, MapPin, Zap, TrendingUp } from "lucide-react";

export default function ClientesAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/clientes";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching clientes analytics:", error);
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
                    <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Radar de <span className="text-pink-600">Clientes</span></h2>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-pink-600 text-white text-[10px] font-black uppercase tracking-widest">Customer Radar</span>
                        <p className="text-gray-400 font-bold italic text-sm">Fidelización, segmentación RFM y distribución geográfica</p>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Main KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    {
                        label: "Valor de Vida (LTV)",
                        val: formatCurrency(data?.kpis?.avg_ltv),
                        icon: <DollarSign />,
                        color: "emerald",
                        desc: "Promedio total invertido"
                    },
                    {
                        label: "Tasa de Retención",
                        val: `${(data?.kpis?.retention_rate || 0).toFixed(1)}%`,
                        icon: <Heart />,
                        color: "pink",
                        desc: "Clientes recurrentes"
                    },
                    {
                        label: "Total Audiencia",
                        val: data?.kpis?.total_customers || 0,
                        icon: <Users />,
                        color: "blue",
                        desc: "Clientes registrados"
                    }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-[3rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 flex flex-col gap-6 hover:translate-y-[-4px] transition-all duration-500 group">
                        <div className={`w-16 h-16 rounded-3xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                            <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{loading ? "..." : kpi.val}</h3>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2">{kpi.desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* RFM Segmentation & Geo */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* RFM Scatter Chart */}
                <div className="bg-white rounded-[4rem] p-12 border border-gray-100 shadow-2xl overflow-hidden group">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl">
                            <Target />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 italic uppercase">Segmentación RFM</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Frecuencia vs Valor del Cliente</p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis type="number" dataKey="frequency" name="Frecuencia" unit=" órden" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} />
                                <YAxis type="number" dataKey="monetary" name="Valor" unit="$" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                <ZAxis type="number" dataKey="recency" range={[50, 400]} name="Recencia" unit=" días" />
                                <Tooltip
                                    cursor={{ strokeDasharray: '3 3' }}
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
                                />
                                <Scatter name="Clientes" data={data?.rfmData || []} fill="#8b5cf6">
                                    {(data?.rfmData || []).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.monetary > 50000 ? '#ec4899' : '#8b5cf6'} />
                                    ))}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Geo Performance */}
                <div className="bg-gray-900 rounded-[4rem] p-12 shadow-2xl text-white flex flex-col">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-blue-600 flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20">
                            <MapPin />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black italic uppercase">Expansión Geográfica</h3>
                            <p className="text-blue-300 font-bold text-xs uppercase tracking-widest mt-1">Órdenes por Provincia</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[350px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.geographic || []} layout="vertical" margin={{ left: 20 }}>
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'white', fontSize: 12, fontWeight: 800 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 10, 10, 0]} barSize={25}>
                                    {(data?.geographic || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={i === 0 ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Acquisition & Activity Row */}
            <div className="bg-white rounded-[4rem] p-12 border border-gray-100 shadow-2xl">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl">
                            <Zap />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-gray-900 italic uppercase">Adquisición de Clientes</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Evolución de nuevos registros</p>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.acquisition || []}>
                            <defs>
                                <linearGradient id="colorAcq" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                tickFormatter={(str) => str ? format(new Date(str), "d MMM", { locale: es }) : ""}
                                axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                            />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
                                itemStyle={{ fontWeight: 800, color: '#3b82f6' }}
                                labelStyle={{ fontWeight: 900, marginBottom: '8px' }}
                            />
                            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={5} fill="url(#colorAcq)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </section>
    );
}
