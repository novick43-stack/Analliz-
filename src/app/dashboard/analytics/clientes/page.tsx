"use client";

import { useEffect, useState, useCallback } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import { Users, ShoppingBag, Box, DollarSign, TrendingUp, Calendar, LayoutGrid, Download, ArrowUpRight, Search } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";

export default function ClientesAnalyticsPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);
    const [productChartType, setProductChartType] = useState<"pie" | "bar">("pie");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");

    const isDark = theme === "dark";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/clientes";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const json = await res.json();
            setData(json);
            setCurrentPage(1); // Reset pagination on range change
        } catch (error) {
            console.error("Error fetching clientes analytics:", error);
            setData({ error: true });
        } finally {
            setLoading(false);
        }
    }, [range]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRangeChange = useCallback((from: string, to: string) => {
        setRange({ from, to });
    }, []);

    // Palette
    const ACCENT = "#5841D8";
    const COLORS = ['#78C9BA', '#F49372', '#F4C051', '#D2B4DE', '#8b5cf6'];

    const new_orders = data?.summary?.new_orders ? Number(data.summary.new_orders) : 0;
    const recurrent_orders = data?.summary?.recurrent_orders ? Number(data.summary.recurrent_orders) : 0;
    const total_orders = new_orders + recurrent_orders;

    const newPercent = total_orders > 0 ? Math.round((new_orders / total_orders) * 100) : 0;
    const recurrentPercent = total_orders > 0 ? Math.max(0, 100 - newPercent) : 0;

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);
    };

    const CustomLegend = ({ payload, total }: any) => {
        return (
            <div className="flex flex-col gap-2 mt-6">
                {payload.map((entry: any, index: number) => {
                    const percentage = total > 0 ? ((entry.payload.value / total) * 100).toFixed(1) : "0";
                    return (
                        <div key={index} className="flex items-center justify-center gap-3">
                            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: entry.color }} />
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-tight">
                                {entry.payload.label} <span className="opacity-60 ml-1">({percentage}%)</span>
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    // Table Filtering
    const filteredCustomers = (data?.detailedCustomers || []).filter((c: any) =>
        c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const itemsPerPage = 10;
    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (data?.error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-muted/20">
                <Users className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-black uppercase text-foreground mb-2">Error al cargar datos</h3>
                <p className="text-sm text-muted-foreground font-medium mb-6 text-center max-w-xs">No pudimos conectar con el servidor. Por favor, intenta de nuevo.</p>
                <button onClick={() => fetchData()} className="px-6 py-2 bg-accent text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all">Reintentar</button>
            </div>
        );
    }

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Clientes</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Base de Datos & Fidelidad</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

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
                        { val: new_orders, label: "compras - clientes nuevos" },
                        { val: recurrent_orders, label: "compras - clientes recurrentes" },
                        { val: `${newPercent} %`, label: "nuevos" },
                        { val: `${recurrentPercent} %`, label: "recurrentes" }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-card rounded-2xl p-6 shadow-sm border-t-4 border-t-accent border-l border-r border-b border-border group hover:border-accent/40 transition-all">
                            {loading ? <Skeleton className="w-24 h-8 mb-4" /> : <p className="text-3xl font-black text-foreground mb-2">{kpi.val}</p>}
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 1. Compras Card */}
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col items-center text-center group transition-all hover:bg-muted/10">
                    <div className="flex flex-col items-center gap-2 mb-6 w-full">
                        <div className="flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-foreground" />
                            <h3 className="text-xl font-bold text-foreground uppercase">Compras</h3>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Cantidad de clientes según cuántas compras realizaron en el período:
                        </p>
                    </div>
                    <div className="h-[220px] w-full relative">
                        {loading ? <Skeleton variant="circle" className="w-48 h-48 mx-auto" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={(data?.frequencyDist || []).map((d: any) => ({ ...d, label: `${d.label} compras` }))}
                                        dataKey="value" nameKey="label" innerRadius={60} outerRadius={85} paddingAngle={4} stroke="none" labelLine={false}
                                        label={({ cx, cy, midAngle = 0, innerRadius = 0, outerRadius = 0, value }) => {
                                            const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                            if (!value) return null;
                                            return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">{value}</text>;
                                        }}
                                    >
                                        {(data?.frequencyDist || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {!loading && <CustomLegend payload={(data?.frequencyDist || []).map((d: any, i: number) => ({ payload: { ...d, label: `${d.label} compras` }, color: COLORS[i % COLORS.length] }))} total={(data?.frequencyDist || []).reduce((acc: number, curr: any) => acc + Number(curr.value), 0)} />}
                    <div className="mt-auto pt-8 border-t border-border/50 w-full">
                        <p className="text-[11px] font-bold text-muted-foreground">Promedio: <span className="text-foreground">{Number(data?.averages?.avg_orders || 0).toFixed(1)} compras por cliente</span></p>
                    </div>
                </div>

                {/* 2. Productos Card */}
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col items-center text-center group transition-all hover:bg-muted/10">
                    <div className="flex flex-col items-center gap-2 mb-4 w-full">
                        <div className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-foreground" />
                            <h3 className="text-xl font-bold text-foreground uppercase">Productos</h3>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Cantidad de clientes según cuántos productos compraron en el período:
                        </p>
                    </div>
                    <div className="flex bg-muted p-1 rounded-xl mb-6 self-center">
                        <button onClick={() => setProductChartType("pie")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${productChartType === "pie" ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>circular</button>
                        <button onClick={() => setProductChartType("bar")} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${productChartType === "bar" ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>barras</button>
                    </div>
                    <div className="h-[220px] w-full relative">
                        {loading ? <Skeleton variant="circle" className="w-48 h-48 mx-auto" /> : productChartType === "pie" ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={(data?.varietyDist || []).map((d: any) => ({ ...d, label: `${d.label} productos` }))} dataKey="value" nameKey="label" innerRadius={60} outerRadius={85} paddingAngle={4} stroke="none" labelLine={false}
                                        label={({ cx, cy, midAngle = 0, innerRadius = 0, outerRadius = 0, value }) => {
                                            const radius = Number(innerRadius) + (Number(outerRadius) - Number(innerRadius)) * 0.5;
                                            const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                                            const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                                            if (!value) return null;
                                            return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-[10px] font-bold">{value}</text>;
                                        }}
                                    >
                                        {(data?.varietyDist || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={(data?.varietyDist || []).map((d: any) => ({ ...d, label: `${d.label} prod.` }))}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Bar dataKey="value" fill="#78C9BA" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    {!loading && productChartType === "pie" && <CustomLegend payload={(data?.varietyDist || []).map((d: any, i: number) => ({ payload: { ...d, label: `${d.label} productos` }, color: COLORS[i % COLORS.length] }))} total={(data?.varietyDist || []).reduce((acc: number, curr: any) => acc + Number(curr.value), 0)} />}
                    <div className="mt-auto pt-8 border-t border-border/50 w-full">
                        <p className="text-[11px] font-bold text-muted-foreground">Promedio: <span className="text-foreground">{Number(data?.averages?.avg_variety || 0).toFixed(1)} productos por cliente</span></p>
                    </div>
                </div>

                {/* 3. Valor de las compras Card */}
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm flex flex-col items-center text-center group transition-all hover:bg-muted/10">
                    <div className="flex flex-col items-center gap-2 mb-6 w-full">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-foreground" />
                            <h3 className="text-xl font-bold text-foreground uppercase">Valor de las compras</h3>
                        </div>
                        <p className="text-[11px] font-medium text-muted-foreground leading-relaxed">
                            Cantidad de clientes según el valor total ($) de las compras que realizaron en el período:
                        </p>
                    </div>
                    <div className="h-[220px] w-full relative mt-4">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.valueDist || []} margin={{ bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                    <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 700 }} interval={0} angle={-15} textAnchor="end" />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                    <Bar dataKey="value" fill="#78C9BA" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                    <div className="mt-auto pt-8 border-t border-border/50 w-full">
                        <p className="text-[11px] font-bold text-muted-foreground">Promedio: <span className="text-foreground">{formatCurrency(data?.averages?.avg_spend || 0)} por cliente</span></p>
                    </div>
                </div>
            </div>

            {/* Segmentación Temporal */}
            <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Segmentación Temporal</h3>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Nuevos vs Recurrentes por día</p>
                    </div>
                    <TrendingUp className="text-accent w-6 h-6" />
                </div>
                <div className="h-[350px] w-full">
                    {loading ? <Skeleton className="w-full h-full" /> : (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.trend || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#262626" : "#f1f5f9"} />
                                <XAxis dataKey="date" tickFormatter={(str) => str ? format(new Date(str), "dd/MM") : ""} axisLine={false} tickLine={false} tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#6b7280' : '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ backgroundColor: isDark ? '#111' : '#fff', borderRadius: '16px', border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}` }} />
                                <Bar dataKey="recurrentes" name="Recurrentes" stackId="a" fill={ACCENT} radius={[0, 0, 0, 0]} />
                                <Bar dataKey="nuevos" name="Nuevos" stackId="a" fill="#ec4899" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Detailed Customers Table */}
            <div className="bg-card rounded-[2rem] border border-border shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-xl shadow-sm">
                            <LayoutGrid />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground tracking-tight uppercase">Base de Clientes</h3>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Actividad y valor por cliente</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-accent" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 pr-4 py-2.5 rounded-xl bg-card border border-border text-xs font-bold focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all w-64"
                            />
                        </div>
                        <button
                            onClick={() => {
                                const headers = ["Nombre", "Email", "Órdenes", "Gasto Total", "Última Compra"];
                                const rows = filteredCustomers.map((c: any) => [
                                    c.name, c.email, c.order_count, c.total_spent, format(new Date(c.last_order_date), "dd/MM/yyyy")
                                ]);
                                const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
                                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                const link = document.createElement("a");
                                link.href = URL.createObjectURL(blob);
                                link.setAttribute("download", `clientes_${format(new Date(), "yyyy-MM-dd")}.csv`);
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
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted text-muted-foreground">
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Órdenes</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Gasto Total</th>
                                <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Última Compra</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}><td colSpan={4} className="px-8 py-4"><Skeleton className="h-4 w-full" /></td></tr>
                                ))
                            ) : paginatedCustomers.length === 0 ? (
                                <tr><td colSpan={4} className="px-8 py-12 text-center text-muted-foreground font-bold italic">No se encontraron clientes coincidentes.</td></tr>
                            ) : (
                                paginatedCustomers.map((customer: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-muted/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <div className="flex flex-col">
                                                <span className="text-xs font-black text-foreground uppercase">{customer.name || "N/A"}</span>
                                                <span className="text-[10px] font-bold text-muted-foreground lowercase opacity-70">{customer.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-[10px] font-black">{customer.order_count}</span>
                                        </td>
                                        <td className="px-8 py-5 text-right font-black text-foreground text-sm">{formatCurrency(customer.total_spent)}</td>
                                        <td className="px-8 py-5 text-right text-xs font-bold text-muted-foreground uppercase">
                                            {format(new Date(customer.last_order_date), "dd/MM/yyyy", { locale: es })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {!loading && totalPages > 1 && (
                    <div className="p-4 bg-muted/10 border-t border-border flex items-center justify-between">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            Mostrando {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} de {filteredCustomers.length} clientes
                        </p>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all active:scale-95">Anterior</button>
                            <span className="text-xs font-black text-foreground w-12 text-center">{currentPage}</span>
                            <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage >= totalPages} className="px-4 py-2 rounded-xl bg-card border border-border text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-muted transition-all active:scale-95">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}
