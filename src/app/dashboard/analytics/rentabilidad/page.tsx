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
    ArrowDownRight,
    Minus
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";

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

            {/* Resumen del período & Navigation */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center border border-border">
                            <Calendar className="w-4 h-4 text-accent" />
                        </div>
                        <h3 className="text-sm font-bold text-foreground">Resumen del período</h3>
                    </div>

                    <div className="flex bg-muted p-1 rounded-xl self-start">
                        {(["general", "publicidad", "clientes"] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {tab}
                            </button>
                        ))}
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

            {/* Placeholder for future detailed analysis charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm min-h-[300px] flex flex-col items-center justify-center opacity-50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <BarChart3 className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Análisis detallado de costos</p>
                    <span className="mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[8px] font-bold uppercase tracking-widest">Próximamente</span>
                </div>
                <div className="bg-card rounded-[2rem] p-8 border border-border shadow-sm min-h-[300px] flex flex-col items-center justify-center opacity-50 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <PieChart className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">Estructura de margen por categoría</p>
                    <span className="mt-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-[8px] font-bold uppercase tracking-widest">Próximamente</span>
                </div>
            </div>
        </section>
    );
}
