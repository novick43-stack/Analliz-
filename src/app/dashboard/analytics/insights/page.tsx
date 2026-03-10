"use client";

import { useEffect, useState, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import {
    Zap, RefreshCcw, TrendingUp, AlertTriangle,
    Layers, FastForward, Activity, Sparkles
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";

export default function InsightsAnalyticsPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

    const isDark = theme === "dark";
    const ACCENT = "#5841D8";
    const COLORS = [ACCENT, '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

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
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);
    };

    return (
        <section className="flex flex-col gap-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tight uppercase leading-none">Estrategia & Insights</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Predictive Data IQ</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* SKU Velocity */}
            <div className="bg-card rounded-[2.5rem] p-12 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-16">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl shadow-xl shadow-accent/20">
                            <FastForward className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">Velocidad de Venta</h3>
                            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Detección de productos de alta rotación</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchData}
                        className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-white transition-all shadow-sm group active:scale-95"
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        [...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="h-64 rounded-[2rem]" />
                        ))
                    ) : (
                        (data?.skuVelocity || []).map((sku: any, i: number) => (
                            <div key={i} className="group overflow-hidden relative p-8 rounded-[2rem] bg-muted border border-border hover:bg-card hover:shadow-2xl hover:border-accent/30 transition-all duration-500">
                                <div className="relative z-10 flex flex-col gap-6">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-black bg-accent/10 text-accent px-3 py-1 rounded-full uppercase tracking-widest border border-accent/20">Hot Sku</span>
                                        <p className="text-2xl font-black text-foreground">{sku.sold_count} <span className="text-[10px] uppercase text-muted-foreground font-bold">vendidos</span></p>
                                    </div>
                                    <h4 className="text-xl font-black text-foreground line-clamp-2 leading-tight uppercase tracking-tight">{sku.name}</h4>
                                    <div className="flex justify-between items-center bg-card/40 backdrop-blur-sm p-5 rounded-2xl border border-border/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Stock Actual</span>
                                            <span className="text-xl font-black text-foreground">{sku.current_stock}</span>
                                        </div>
                                        <div className="w-2 h-12 bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="w-full bg-accent rounded-full transition-all duration-1000 origin-bottom"
                                                style={{ height: `${Math.min((sku.sold_count / (sku.current_stock || 1)) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <Activity className="absolute bottom-[-10%] right-[-10%] w-40 h-40 text-accent opacity-[0.03] group-hover:opacity-[0.08] group-hover:scale-125 transition-all duration-700 pointer-events-none" />
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Distribution and Smart Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* AOV Chart */}
                <div className="lg:col-span-2 bg-card rounded-[3rem] p-12 border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-6 mb-16">
                        <div className="w-14 h-14 rounded-2xl bg-accent text-white flex items-center justify-center text-3xl shadow-xl shadow-accent/20">
                            <Layers className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">Ticket Portfolio</h3>
                            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Distribución de facturación por ticket medio</p>
                        </div>
                    </div>

                    <div className="h-[400px] w-full flex-1">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.aovDistribution || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                    <XAxis
                                        dataKey="bucket"
                                        tickFormatter={(v) => `$${v / 1000}k`}
                                        axisLine={false} tickLine={false} tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                    />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                    <Tooltip
                                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{
                                            backgroundColor: isDark ? '#111111' : '#ffffff',
                                            borderRadius: '24px',
                                            border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`
                                        }}
                                    />
                                    <Bar dataKey="count" fill={ACCENT} radius={[12, 12, 0, 0]}>
                                        {(data?.aovDistribution || []).map((_: any, i: number) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Insight Summary */}
                <div className="bg-muted rounded-[3rem] p-12 border border-border flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-2xl font-black text-foreground uppercase tracking-tight italic">Estrategia Smart</h3>
                        <p className="text-muted-foreground font-bold text-sm leading-relaxed">
                            Algoritmos de detección temprana de tendencias y riesgos de inventario.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        {[
                            { label: "Oportunidad de Stock", text: "3 SKUs críticos con velocidad de venta ascendente.", icon: <AlertTriangle className="text-rose-500" /> },
                            { label: "Core Business Zone", text: "Tu zona de rentabilidad máxima está entre $40k y $60k.", icon: <Zap className="text-accent" /> },
                            { label: "Crecimiento Proyectado", text: "Se estima un incremento del 12% en demanda para el próximo ciclo.", icon: <TrendingUp className="text-emerald-500" /> }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6 p-6 rounded-[2rem] bg-card border border-border shadow-sm hover:border-accent/20 transition-all group">
                                <div className="text-2xl mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{item.icon}</div>
                                <div className="flex-1">
                                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">{item.label}</p>
                                    {loading ? <Skeleton className="w-full h-8 mt-2" /> : <p className="text-xs font-bold text-foreground leading-snug tracking-tight">{item.text}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 p-8 rounded-[2rem] bg-accent text-white shadow-xl shadow-accent/20">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Next Action</span>
                        </div>
                        <p className="text-xs font-bold text-white/80 leading-relaxed">
                            Optimiza el bundle de los productos en la 'Core Business Zone' para elevar el AOV global.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
