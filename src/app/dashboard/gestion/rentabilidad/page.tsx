"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import {
    TrendingUp,
    ShoppingBag,
    DollarSign,
    Receipt,
    PieChart,
    BarChart3,
    Calendar,
    HelpCircle,
    ArrowUpRight,
    Search
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

export default function RentabilidadPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);
    const [activeTab, setActiveTab] = useState<"general" | "publicidad" | "clientes">("general");

    const isDark = theme === "dark";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/rentabilidad";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API Error: ${res.status}`);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching rentabilidad analytics:", error);
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

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(val || 0);
    };

    const formatPercent = (val: number) => {
        return `${(val || 0).toFixed(0)}%`;
    };

    if (data?.error) {
        return (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-border rounded-3xl bg-muted/20">
                <TrendingUp className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-black uppercase text-foreground mb-2">Error al cargar datos</h3>
                <p className="text-sm text-muted-foreground font-medium mb-6 text-center max-w-xs">No pudimos conectar con el servidor. Por favor, intenta de nuevo.</p>
                <button onClick={() => fetchData()} className="px-6 py-2 bg-accent text-white rounded-xl font-bold uppercase text-[10px] tracking-widest shadow-lg shadow-accent/20 active:scale-95 transition-all">Reintentar</button>
            </div>
        );
    }

    const KPICard = ({ title, value, type = "currency" }: { title: string, value: any, type?: "currency" | "number" | "percent" }) => (
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border group hover:border-accent/40 transition-all relative">
            <div className="absolute top-4 right-4">
                <HelpCircle className="w-4 h-4 text-muted-foreground/40 hover:text-accent transition-colors cursor-help" />
            </div>
            {loading ? (
                <Skeleton className="w-24 h-8 mb-4" />
            ) : (
                <p className="text-2xl font-black text-foreground mb-2">
                    {type === "currency" ? formatCurrency(value) : type === "percent" ? formatPercent(value) : value}
                </p>
            )}
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em]">{title}</p>
        </div>
    );

    const DistributionChart = ({ title, subtitle, data: chartData }: { title: string, subtitle: string, data: any[] }) => {
        const total = chartData?.reduce((acc, curr) => acc + curr.value, 0) || 0;

        return (
            <div className="bg-card rounded-[2.5rem] p-8 border border-border shadow-sm flex flex-col h-full">
                <div className="mb-6">
                    <h3 className="text-xl font-black text-foreground mb-1">{title}</h3>
                    <p className="text-xs text-muted-foreground font-medium">{subtitle}</p>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] relative">
                    <ResponsiveContainer width="100%" height={240}>
                        <RePieChart>
                            <Pie
                                data={chartData || []}
                                cx="50%"
                                cy="50%"
                                innerRadius={70}
                                outerRadius={90}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {chartData?.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color || [
                                        "#78C9BA", "#F49372", "#F4C051", "#A78BFA", "#F87171", "#60A5FA"
                                    ][index % 6]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{ backgroundColor: isDark ? '#1e293b' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ fontWeight: 'bold', fontSize: '12px' }}
                                formatter={(value: any) => formatCurrency(Number(value || 0))}
                            />
                        </RePieChart>
                    </ResponsiveContainer>

                    {/* Sum center text */}
                    {!loading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none transform translate-y-[-10px]">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total</span>
                            <span className="text-lg font-black text-foreground leading-none">{formatCurrency(total)}</span>
                        </div>
                    )}
                </div>

                <div className="grid gap-3 mt-6">
                    {chartData?.map((item, idx) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                            <div key={idx} className="flex items-center justify-between group/item">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{
                                        backgroundColor: item.color || [
                                            "#78C9BA", "#F49372", "#F4C051", "#A78BFA", "#F87171", "#60A5FA"
                                        ][idx % 6]
                                    }} />
                                    <span className="text-xs font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{item.name}</span>
                                </div>
                                <span className="text-xs font-black text-foreground/80">({percentage.toFixed(0)}%)</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Rentabilidad</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Finanzas & Márgenes</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Resumen del período */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-border">
                            <Calendar className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Resumen del período</h3>
                    </div>
                </div>

                {/* KPI Grid - Matching the 7-card layout from reference image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <KPICard title="Ventas" value={data?.ventas} type="number" />
                    <KPICard title="Ingresos" value={data?.ingresos} />
                    <KPICard title="Ticket promedio" value={data?.ticket_promedio} />
                    <KPICard title="Costos totales" value={data?.costos_totales} />
                    <KPICard title="Ganancia" value={data?.ganancia} />
                    <KPICard title="Margen bruto %" value={data?.margen_bruto} type="percent" />
                    <KPICard title="Rentabilidad %" value={data?.rentabilidad} type="percent" />
                </div>
            </div>

            {/* Distribution Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <DistributionChart
                    title="Ganancia, costos y descuentos"
                    subtitle="Distribución en el período seleccionado:"
                    data={data?.distributions?.main}
                />
                <DistributionChart
                    title="Distribución de costos"
                    subtitle="Desglose detallado por categoría:"
                    data={data?.distributions?.costs}
                />
                <DistributionChart
                    title="Distribución de descuentos"
                    subtitle="Impacto de promos y cupones:"
                    data={data?.distributions?.discounts}
                />
            </div>

            {/* Detailed Analysis Section (Merged from previous design) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4 animate-in fade-in slide-in-from-bottom-5 duration-700">
                {/* Net Margin insight with premium styling */}
                <div className="bg-gradient-to-br from-slate-900 to-accent rounded-[3rem] p-10 text-white shadow-2xl flex flex-col gap-8 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-40 translate-x-40 group-hover:scale-110 transition-transform duration-1000" />

                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-2xl">💎</div>
                        <div>
                            <h3 className="text-2xl font-black">Margen Neto</h3>
                            <p className="text-accent-foreground/60 font-medium text-xs">Análisis en tiempo real</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-end">
                            {loading ? (
                                <Skeleton className="w-24 h-10 bg-white/10" />
                            ) : (
                                <span className="text-5xl font-black">{formatPercent(data?.rentabilidad)}</span>
                            )}
                            <span className="text-xs font-bold opacity-60 italic">{data?.rentabilidad > 0 ? "Margen positivo" : "Cálculo pendiente"}</span>
                        </div>
                        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white transition-all duration-1000"
                                style={{ width: `${Math.min(100, Math.max(0, data?.rentabilidad || 0))}%` }}
                            />
                        </div>
                    </div>

                    <p className="text-xs font-medium leading-relaxed opacity-70 max-w-sm">
                        Mantené tus costos actualizados en la sección de Gestión para obtener una visión precisa de la rentabilidad de tu negocio.
                    </p>
                </div>

                {/* Best Selling Products placeholder */}
                <div className="bg-card rounded-[3rem] p-10 border border-border shadow-xl flex flex-col gap-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-black text-foreground">Productos más Rentables</h3>
                        <BarChart3 className="text-muted-foreground w-6 h-6 opacity-20" />
                    </div>
                    <div className="flex flex-col gap-4 items-center justify-center py-16 bg-muted/30 rounded-[2rem] border-2 border-dotted border-border text-muted-foreground/60">
                        <div className="w-16 h-16 rounded-full bg-background flex items-center justify-center shadow-inner mb-4">
                            <Search className="w-6 h-6 opacity-20" />
                        </div>
                        <p className="font-bold text-xs uppercase tracking-widest italic text-center px-8">Estamos procesando los datos de costos para este ranking...</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
