"use client";

import { useEffect, useState, useCallback } from "react";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import Skeleton from "@/components/ui/Skeleton";
import {
    DollarSign,
    ShoppingBag,
    TrendingUp,
    BarChart3,
    ArrowUpRight,
    Calendar
} from "lucide-react";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface IngresosData {
    summary: {
        totalRevenue: number;
        orderCount: number;
        averageTicket: number;
    };
    chartData: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
}

export default function IngresosPage() {
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);
    const [data, setData] = useState<IngresosData | null>(null);
    const [loading, setLoading] = useState(true);

    const handleRangeChange = useCallback((from: string, to: string) => {
        setRange({ from, to });
    }, []);

    const fetchData = async () => {
        if (!range) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/gestion/ingresos?from=${range.from}&to=${range.to}`);
            const json = await res.json();
            if (res.ok) setData(json);
        } catch (e) {
            console.error("Error fetching ingresos data:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [range]);

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val);
    };

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Ingresos</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest">
                            Ventas & Facturación
                        </span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-16 h-16 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ingresos Totales</p>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        {loading ? <Skeleton className="h-10 w-32" /> : formatCurrency(data?.summary.totalRevenue || 0)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-tighter">
                            <ArrowUpRight className="w-3 h-3" />
                            <span>Ventas Netas</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-16 h-16 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Cantidad de Órdenes</p>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        {loading ? <Skeleton className="h-10 w-24" /> : data?.summary.orderCount || 0}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-tighter">
                            <Calendar className="w-3 h-3" />
                            <span>En el periodo</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-16 h-16 text-indigo-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ticket Promedio</p>
                    <div className="text-4xl font-black text-foreground tabular-nums">
                        {loading ? <Skeleton className="h-10 w-32" /> : formatCurrency(data?.summary.averageTicket || 0)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-2">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-tighter">
                            <BarChart3 className="w-3 h-3" />
                            <span>Por Orden</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Chart */}
            <div className="bg-card p-8 rounded-[3rem] border border-border shadow-sm flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Evolución de Ingresos</h3>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Facturación diaria en el periodo seleccionado</p>
                    </div>
                </div>

                <div className="h-[400px] w-full">
                    {loading ? (
                        <Skeleton className="h-full w-full rounded-3xl" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--muted-foreground)"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                />
                                <YAxis
                                    stroke="var(--muted-foreground)"
                                    fontSize={10}
                                    fontWeight="bold"
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(val) => `$${val / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '1rem',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                    }}
                                    formatter={(val: any) => [formatCurrency(Number(val) || 0), 'Ingresos']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="var(--accent)"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </section>
    );
}
