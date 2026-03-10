"use client";

import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, ComposedChart, Legend
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import HeatmapChart from "@/components/analytics/HeatmapChart";
import { DollarSign, ShoppingBag, TrendingUp, RefreshCcw, Zap, ArrowUpRight, ArrowDownRight, Percent, Clock, Calendar, MapPin, Users as UsersIcon, LayoutGrid, Download, PieChart as PieIcon, BarChart2 } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";

export default function VentasAnalyticsPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<any>(null);
    const [conversionData, setConversionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);
    const [showRevenue, setShowRevenue] = useState(true);
    const [showOrders, setShowOrders] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [syncing, setSyncing] = useState(false);
    const [syncProgress, setSyncProgress] = useState({ message: "", progress: 0 });
    const [geoChartType, setGeoChartType] = useState<"pie" | "bar">("pie");

    const isDark = theme === "dark";

    const handleSync = async () => {
        setSyncing(true);
        setSyncProgress({ message: "Iniciando...", progress: 0 });
        try {
            const response = await fetch("/api/tiendanube/sync", { method: "POST" });
            if (!response.ok) throw new Error("Sync failed");

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();

            if (!reader) throw new Error("No reader");

            let done = false;
            let buffer = "";
            while (!done) {
                const { value, done: doneReading } = await reader.read();
                done = doneReading;
                if (value) {
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split("\n");
                    buffer = lines.pop() || ""; // Keep the last partial line in buffer

                    for (const line of lines) {
                        if (!line.trim()) continue;
                        try {
                            const data = JSON.parse(line);
                            setSyncProgress(data);
                        } catch (e) {
                            console.error("Error parsing sync chunk:", e);
                        }
                    }
                }
            }
            fetchData();
        } catch (error) {
            console.error("Sync error:", error);
            setSyncProgress({ message: "Error en la sincronización", progress: -1 });
        } finally {
            setTimeout(() => setSyncing(false), 3000);
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            let baseUrl = "/api/analytics/ventas";
            let convUrl = "/api/analytics/conversion";
            if (range) {
                baseUrl += `?from=${range.from}&to=${range.to}`;
                convUrl += `?from=${range.from}&to=${range.to}`;
            }
            const [ventasRes, convRes] = await Promise.all([
                fetch(baseUrl),
                fetch(convUrl)
            ]);
            const [ventasJson, convJson] = await Promise.all([
                ventasRes.json(),
                convRes.json()
            ]);
            setData(ventasJson);
            setConversionData(convJson);
        } catch (error) {
            console.error("Error fetching analytics:", error);
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

    const calculateDelta = (current: any, prev: any) => {
        const currNum = typeof current === 'string' ? Number(current.replace(/[^0-9.-]+/g, "")) : Number(current);
        const prevNum = Number(prev);
        if (!prevNum || prevNum === 0) return 0;
        return ((currNum - prevNum) / prevNum) * 100;
    };

    // Mailkit-inspired palette
    const ACCENT = "#5841D8";
    const COLORS = [ACCENT, '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

    const kpis = [
        {
            label: "Facturación Total",
            val: formatCurrency(data?.kpis?.total_revenue),
            prev: data?.prevKpis?.total_revenue,
            icon: <DollarSign />,
            color: "accent"
        },
        {
            label: "Cantidad de Órdenes",
            val: data?.kpis?.total_orders || 0,
            prev: data?.prevKpis?.total_orders,
            icon: <ShoppingBag />,
            color: "violet"
        },
        {
            label: "Ticket Promedio",
            val: formatCurrency(data?.kpis?.average_ticket),
            prev: data?.prevKpis?.average_ticket,
            icon: <TrendingUp />,
            color: "indigo"
        }
    ];

    const daysInRange = range ? Math.max(1, Math.ceil((new Date(range.to).getTime() - new Date(range.from).getTime()) / (1000 * 60 * 60 * 24))) : 1;
    const revenuePerDay = (data?.kpis?.total_revenue || 0) / daysInRange;
    const totalProvinceRevenue = data?.salesByProvince?.reduce((acc: number, curr: any) => acc + (curr.revenue || 0), 0) || 1;

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Ventas</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Performance Center</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <DateRangePicker onRangeChange={handleRangeChange} />
                    <button
                        onClick={handleSync}
                        disabled={syncing}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all shadow-lg active:scale-95 ${syncing
                            ? 'bg-muted text-muted-foreground cursor-not-allowed'
                            : 'bg-accent text-white hover:bg-accent/90 shadow-accent/20'
                            }`}
                    >
                        <RefreshCcw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                        {syncing ? 'Sincronizando...' : 'Sincronizar nuevas ventas'}
                    </button>
                </div>
            </div>

            {/* Sync Progress Indicator */}
            {syncing && (
                <div className="bg-card rounded-[1.5rem] p-6 border border-accent/20 shadow-xl shadow-accent/5 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                                <Zap className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-accent">Sincronización en curso</span>
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{syncProgress.progress}%</span>
                    </div>

                    <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-3 border border-border/50">
                        <div
                            className="h-full bg-accent transition-all duration-500 ease-out shadow-[0_0_15px_rgba(88,65,216,0.5)]"
                            style={{ width: `${Math.max(5, syncProgress.progress)}%` }}
                        />
                    </div>

                    <p className="text-[11px] font-bold text-foreground uppercase tracking-tight flex items-center gap-2 italic">
                        <RefreshCcw className="w-3 h-3 animate-spin text-accent" />
                        {syncProgress.message || "Procesando datos..."}
                    </p>
                </div>
            )}

            {/* Resumen del período */}
            <div className="bg-muted rounded-[2rem] p-8 border border-border">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-card rounded-xl flex items-center justify-center shadow-sm border border-border">
                            <Calendar className="w-5 h-5 text-accent" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground uppercase tracking-tight">Resumen del período</h3>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: "ventas", val: data?.kpis?.total_orders || 0 },
                        { label: "por día", val: formatCurrency(revenuePerDay) },
                        { label: "total facturado", val: formatCurrency(data?.kpis?.total_revenue) },
                        { label: "ticket promedio", val: formatCurrency(data?.kpis?.average_ticket) }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border border-border group hover:border-accent/50 transition-colors">
                            {loading ? <Skeleton className="w-24 h-8 mb-4" /> : <p className="text-3xl font-black text-foreground mb-2">{kpi.val}</p>}
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main KPIs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => {
                    const delta = calculateDelta(kpi.val, kpi.prev);
                    return (
                        <div key={i} className="bg-card rounded-[1.5rem] p-6 border border-border shadow-sm flex flex-col gap-4 hover:border-accent/30 transition-all group overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className={`w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                    {kpi.icon}
                                </div>
                                {loading ? (
                                    <Skeleton className="w-10 h-4" />
                                ) : (
                                    <div className={`flex items-center gap-1 text-xs font-bold ${delta >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {delta >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                                        {Math.abs(delta).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                                {loading ? <Skeleton className="w-24 h-8" /> : <h3 className="text-3xl font-black text-foreground tracking-tight">{kpi.val}</h3>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Revenue & Orders Chart */}
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm overflow-hidden relative group">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Evolución</h3>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Comparativa de ingresos vs pedidos</p>
                    </div>
                    <div className="flex bg-muted p-1 rounded-xl">
                        <button
                            onClick={() => setShowRevenue(!showRevenue)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showRevenue ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}
                        >
                            Ingresos
                        </button>
                        <button
                            onClick={() => setShowOrders(!showOrders)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showOrders ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}
                        >
                            Pedidos
                        </button>
                    </div>
                </div>

                <div className="h-[350px] w-full">
                    {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <Skeleton className="w-full h-full" />
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={data?.revenueOverTime || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => str ? format(new Date(str), "d MMM", { locale: es }) : ""}
                                    axisLine={false} tickLine={false} tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }} minTickGap={40}
                                />
                                {showRevenue && (
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        tickFormatter={(v) => `$${v / 1000}k`}
                                    />
                                )}
                                {showOrders && (
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: ACCENT, fontSize: 10, fontWeight: 700 }}
                                    />
                                )}
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: isDark ? '#111111' : '#ffffff',
                                        borderRadius: '16px',
                                        border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`,
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'
                                    }}
                                    itemStyle={{ fontWeight: 700, fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 800, marginBottom: '8px', color: isDark ? '#ffffff' : '#000000' }}
                                    formatter={(value: any, name?: string) => {
                                        if (name === "Ingresos") return [formatCurrency(value), name];
                                        return [value, name || ""];
                                    }}
                                />
                                {showOrders && <Bar yAxisId="right" dataKey="orders" name="Pedidos" fill={ACCENT} radius={[4, 4, 0, 0]} opacity={0.6} barSize={24} />}
                                {showRevenue && <Area yAxisId="left" type="monotone" dataKey="revenue" name="Ingresos" stroke={ACCENT} strokeWidth={4} fill="url(#colorRev)" />}
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Heatmap & Others Grid */}
            <div className="grid grid-cols-1 gap-8">
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shadow-sm">
                            <Clock />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Actividad Horaria</h3>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Picos de demanda histórica</p>
                        </div>
                    </div>
                    {loading ? <Skeleton className="w-full h-[350px]" /> : <HeatmapChart data={data?.salesByDayHour || []} loading={loading} />}
                </div>
            </div>

            {/* Demographics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col">
                    <div className="flex items-center justify-between gap-4 mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shadow-sm">
                                <MapPin />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Geolocalización</h3>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Órdenes por Provincia</p>
                            </div>
                        </div>
                        <div className="flex bg-muted p-1 rounded-xl shrink-0">
                            <button
                                onClick={() => setGeoChartType("pie")}
                                className={`p-1.5 rounded-lg transition-all ${geoChartType === "pie" ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Torta"
                            >
                                <PieIcon className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setGeoChartType("bar")}
                                className={`p-1.5 rounded-lg transition-all ${geoChartType === "bar" ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                                title="Barras"
                            >
                                <BarChart2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <div className="h-[300px] w-full relative flex flex-col items-center justify-center">
                        {loading ? <Skeleton variant="circle" className="w-48 h-48" /> : data?.salesByProvince?.length > 0 ? (
                            geoChartType === "pie" ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.salesByProvince || []}
                                            dataKey="revenue"
                                            nameKey="province"
                                            innerRadius={70}
                                            outerRadius={100}
                                            paddingAngle={4}
                                        >
                                            {(data?.salesByProvince || []).map((_: any, i: number) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: isDark ? '#111111' : '#ffffff',
                                                borderRadius: '12px',
                                                border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`
                                            }}
                                            formatter={(value: any) => [formatCurrency(value), "Ingresos"]}
                                        />
                                        <Legend
                                            layout="vertical"
                                            verticalAlign="middle"
                                            align="right"
                                            iconType="circle"
                                            formatter={(value, entry: any) => {
                                                const percent = ((entry.payload.revenue / totalProvinceRevenue) * 100).toFixed(1);
                                                return (
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2">
                                                        {value}: <span className="text-foreground">{percent}%</span>
                                                    </span>
                                                );
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={[...(data?.salesByProvince || [])].sort((a, b) => b.revenue - a.revenue)}
                                        layout="vertical"
                                        margin={{ left: 30, right: 30 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="province"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                            width={100}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: isDark ? '#111111' : '#ffffff',
                                                borderRadius: '12px',
                                                border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`
                                            }}
                                            formatter={(value: any) => [formatCurrency(value), "Ingresos"]}
                                        />
                                        <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                                            {(data?.salesByProvince || []).map((_: any, i: number) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )
                        ) : (
                            <div className="flex flex-col items-center gap-2 opacity-50">
                                <MapPin className="w-12 h-12 text-muted-foreground" />
                                <p className="text-[10px] font-bold uppercase tracking-widest">Sin datos geográficos</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shadow-sm">
                            <UsersIcon />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Perfil Demográfico</h3>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Análisis por rango etario</p>
                        </div>
                    </div>
                    <div className="h-[250px] w-full">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.salesByAge || []}>
                                    <defs>
                                        <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={ACCENT} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="age"
                                        tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: isDark ? '#111111' : '#ffffff',
                                            borderRadius: '12px',
                                            border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`
                                        }}
                                    />
                                    <Area type="monotone" dataKey="count" stroke={ACCENT} strokeWidth={3} fillOpacity={1} fill="url(#colorAge)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-8 pt-8 border-t border-border flex justify-between items-center">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Edad Promedio</span>
                        <span className="text-2xl font-black text-foreground">{data?.averageAge || 0} años</span>
                    </div>
                </div>
            </div>

            {/* Detailed Orders Table */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shadow-sm">
                            <LayoutGrid />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Explorador de Ventas</h3>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Detalle granular de transacciones</p>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            const headers = ["Orden", "Fecha", "Cliente", "Total", "Estado Pago", "Productos"];
                            const rows = (data?.detailedOrders || []).map((o: any) => [
                                `#${o.number}`,
                                format(new Date(o.created_at), "dd/MM/yyyy"),
                                o.customer_name || "N/A",
                                o.total,
                                o.payment_status,
                                o.items?.map((i: any) => `${i.name} (x${i.quantity})`).join("; ")
                            ]);
                            const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                            const link = document.createElement("a");
                            link.href = URL.createObjectURL(blob);
                            link.setAttribute("download", `ventas_${format(new Date(), "yyyy-MM-dd")}.csv`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                        }}
                        className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-accent/90 transition-all shadow-lg shadow-accent/20 active:scale-95"
                    >
                        <Download className="w-4 h-4" />
                        Exportar CSV
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted text-muted-foreground">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Orden</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Fecha</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Total</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Estado Pago</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Principal Producto</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-8 py-4"><Skeleton className="h-4 w-full" /></td>
                                    </tr>
                                ))
                            ) : data?.detailedOrders?.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-12 text-center text-muted-foreground font-bold italic">No se encontraron ventas en este período.</td>
                                </tr>
                            ) : (
                                (data?.detailedOrders || [])
                                    .slice((currentPage - 1) * 5, currentPage * 5)
                                    .map((order: any) => (
                                        <tr key={order.id} className="hover:bg-muted/50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <a
                                                    href={data?.storeName
                                                        ? `https://${data.storeName}.mitiendanube.com/admin/orders/${order.id}`
                                                        : `https://admin.tiendanube.com/admin/${data?.storeId}/orders/${order.id}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-black text-accent text-sm uppercase hover:underline flex items-center gap-1"
                                                >
                                                    #{order.number}
                                                    <ArrowUpRight className="w-3 h-3" />
                                                </a>
                                            </td>
                                            <td className="px-8 py-5 text-xs font-bold text-muted-foreground uppercase">{format(new Date(order.created_at), "dd/MM HH:mm", { locale: es })}</td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-foreground uppercase">{order.customer_name || "Visitante"}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground lowercase opacity-70">{order.customer_email || "N/A"}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right font-black text-foreground text-sm">{formatCurrency(order.total)}</td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${order.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                                    }`}>
                                                    {order.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 max-w-xs">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-[10px] font-black text-foreground uppercase truncate">
                                                        {order.items?.[0]?.name || "Desconocido"}
                                                    </span>
                                                    {order.items?.length > 1 && (
                                                        <span className="text-[8px] font-bold text-accent uppercase tracking-widest">
                                                            + {order.items.length - 1} productos adicionales
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            )}
                        </tbody>
                    </table>
                </div>
                {/* Pagination Controls */}
                {!loading && data?.detailedOrders?.length > 5 && (
                    <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Mostrando {(currentPage - 1) * 5 + 1} - {Math.min(currentPage * 5, data.detailedOrders.length)} de {data.detailedOrders.length} ventas
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all active:scale-95"
                            >
                                Anterior
                            </button>
                            <span className="text-xs font-black text-foreground w-12 text-center">{currentPage}</span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(data.detailedOrders.length / 5), prev + 1))}
                                disabled={currentPage >= Math.ceil(data.detailedOrders.length / 5)}
                                className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all active:scale-95"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Promo Impact */}
            <div className="bg-accent rounded-[3rem] p-12 text-white shadow-2xl shadow-accent/20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
                    <div className="md:col-span-1">
                        <div className="flex items-center gap-4 mb-6">
                            <Zap className="w-10 h-10" />
                            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Impacto Promo</h3>
                        </div>
                        <p className="font-medium text-white/70 mb-8 max-w-xs">
                            Analizamos la efectividad de tus cupones y descuentos promocionales en la facturación.
                        </p>
                        <div className="p-8 rounded-3xl bg-white/10 backdrop-blur-sm border border-white/10">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-1">Tasa de Uso</p>
                            <p className="text-4xl font-black italic">
                                {((data?.promoImpact?.find((p: any) => p.type === 'Promocional')?.count || 0) / (data?.kpis?.total_orders || 1) * 100).toFixed(1)}%
                            </p>
                        </div>
                    </div>
                    <div className="md:col-span-2 h-[300px]">
                        {loading ? <Skeleton className="w-full h-full opacity-20" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.promoImpact || []}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: 13 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="revenue" radius={[12, 12, 0, 0]} barSize={80}>
                                        {(data?.promoImpact || []).map((entry: any, i: number) => (
                                            <Cell key={i} fill={entry.type === 'Promocional' ? '#ffffff' : 'rgba(255,255,255,0.2)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </section >
    );
}
