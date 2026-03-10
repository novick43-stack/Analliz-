"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import FunnelChart from "@/components/analytics/FunnelChart";
import {
    Filter, ShoppingCart,
    CreditCard, Truck, CheckCircle, XCircle, ArrowRight
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";

export default function ConversionAnalyticsPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

    const isDark = theme === "dark";

    const fetchData = async () => {
        setLoading(true);
        try {
            let url = "/api/analytics/conversion";
            if (range) {
                url += `?from=${range.from}&to=${range.to}`;
            }
            const res = await fetch(url);
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error("Error fetching conversion analytics:", error);
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

    const funnelStages = [
        { name: "Total Pedidos", value: data?.summary?.total_orders || 0 },
        {
            name: "Pagados",
            value: data?.statusFunnel?.filter((s: any) => s.payment_status === 'paid').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        },
        {
            name: "Enviados",
            value: data?.statusFunnel?.filter((s: any) => s.shipping_status === 'shipped' || s.shipping_status === 'delivered').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        },
        {
            name: "Finalizados",
            value: data?.statusFunnel?.filter((s: any) => s.status === 'closed').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        }
    ];

    const conversionRate = data?.summary?.total_orders ? ((funnelStages[funnelStages.length - 1].value / data.summary.total_orders) * 100).toFixed(1) : 0;

    return (
        <section className="flex flex-col gap-12 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tight uppercase leading-none">Conversión de Embudo</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">Efficiency Metrics</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Conversion KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Checkouts", val: data?.summary?.total_orders, icon: <ShoppingCart />, color: "accent" },
                    { label: "Unique Buyers", val: data?.summary?.unique_customers, icon: <Users />, color: "violet" },
                    { label: "Completion Rate", val: `${conversionRate}%`, icon: <CheckCircle />, color: "emerald" },
                    { label: "Chur / Dropout", val: (data?.summary?.total_orders - funnelStages[1].value) || 0, icon: <XCircle />, color: "rose" }
                ].map((kpi, i) => (
                    <div key={i} className="bg-card rounded-[1.5rem] p-8 border border-border shadow-sm flex flex-col gap-6 group hover:border-accent/30 transition-all">
                        <div className={`w-12 h-12 rounded-2xl bg-${kpi.color === 'accent' ? 'accent/10' : 'muted'} text-${kpi.color === 'accent' ? 'accent' : 'foreground'} flex items-center justify-center text-xl`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                            {loading ? <Skeleton className="w-24 h-8" /> : <h3 className="text-3xl font-black text-foreground">{kpi.val}</h3>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Funnel Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-card rounded-[2.5rem] p-12 border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h3 className="text-3xl font-black text-foreground tracking-tight uppercase">Flow Analysis</h3>
                            <p className="text-muted-foreground font-bold text-xs uppercase tracking-widest mt-1">Tasas de caída por etapa crítica</p>
                        </div>
                    </div>
                    {loading ? <Skeleton className="w-full h-[350px]" /> : <FunnelChart data={funnelStages} />}
                </div>

                <div className="bg-muted rounded-[2.5rem] p-10 border border-border flex flex-col justify-between">
                    <div>
                        <h3 className="text-xl font-black mb-10 uppercase tracking-tight">Leakage Points</h3>
                        <div className="flex flex-col gap-6">
                            {[
                                { stage: "Pago Pendiente", val: data?.statusFunnel?.filter((s: any) => s.payment_status === 'pending').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <CreditCard className="text-accent" /> },
                                { stage: "Logística Pendiente", val: data?.statusFunnel?.filter((s: any) => s.shipping_status === 'unpacked').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <Truck className="text-indigo-400" /> },
                                { stage: "Cancelados", val: data?.statusFunnel?.filter((s: any) => s.status === 'cancelled').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <XCircle className="text-rose-400" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-2xl bg-card border border-border shadow-sm">
                                    <div className="text-xl">{item.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">{item.stage}</p>
                                        {loading ? <Skeleton className="w-20 h-6 mt-1" /> : <p className="text-xl font-black text-foreground">{item.val} orders</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 p-8 rounded-3xl bg-accent text-white shadow-xl shadow-accent/20">
                        <div className="flex items-center gap-2 mb-4">
                            <Sparkles className="w-4 h-4" />
                            <p className="font-bold text-[10px] uppercase tracking-widest">IA Insights</p>
                        </div>
                        <p className="text-white/80 text-xs font-bold leading-relaxed">
                            Hemos detectado una caída del 15% en la etapa de pago. Considera habilitar más métodos de pago instantáneos.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

// Support Icons
function Sparkles(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
            <path d="M5 3v4" />
            <path d="M19 17v4" />
            <path d="M3 5h4" />
            <path d="M17 19h4" />
        </svg>
    );
}

function Users(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}
