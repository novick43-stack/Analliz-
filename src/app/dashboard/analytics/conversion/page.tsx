"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import FunnelChart from "@/components/analytics/FunnelChart";
import {
    Filter, RefreshCcw, ArrowRight, ShoppingCart,
    CreditCard, Truck, CheckCircle, XCircle
} from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function ConversionAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);

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

    // Build funnel data from status
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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="flex flex-col gap-4">
                    <h2 className="text-6xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Conversión <span className="text-blue-600">Funnels</span></h2>
                    <div className="flex items-center gap-3">
                        <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest">Efficiency metrics</span>
                        <p className="text-gray-400 font-bold italic text-sm">Análisis del embudo crítico de ventas y logística</p>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Conversion KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {[
                    { label: "Checkouts", val: data?.summary?.total_orders, icon: <ShoppingCart />, color: "blue" },
                    { label: "Unique Buyers", val: data?.summary?.unique_customers, icon: <ArrowRight />, color: "indigo" },
                    { label: "Close Rate", val: `${conversionRate}%`, icon: <CheckCircle />, color: "emerald" },
                    { label: "Abandoned/Ext", val: (data?.summary?.total_orders - funnelStages[1].value) || 0, icon: <XCircle />, color: "orange" }
                ].map((kpi, i) => (
                    <div key={i} className="bg-white rounded-[1.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center text-xl`}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-1">{kpi.label}</p>
                            {loading ? <Skeleton className="w-24 h-8" /> : <h3 className="text-3xl font-black text-gray-900">{kpi.val}</h3>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Funnel Visualizer */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-16">
                        <div>
                            <h3 className="text-4xl font-black text-gray-900 italic tracking-tighter uppercase">Checkout Flow</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-2">Tasas de caída por etapa</p>
                        </div>
                        <Filter className="w-10 h-10 text-gray-100" />
                    </div>
                    {loading ? <Skeleton className="w-full h-[400px]" /> : <FunnelChart data={funnelStages} />}
                </div>

                <div className="bg-gray-900 rounded-[2rem] p-12 shadow-2xl text-white flex flex-col justify-between">
                    <div>
                        <h3 className="text-2xl font-black mb-8 italic uppercase">Puntos de Fuga</h3>
                        <div className="flex flex-col gap-8">
                            {[
                                { stage: "Pago Pendiente", val: data?.statusFunnel?.filter((s: any) => s.payment_status === 'pending').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <CreditCard className="text-orange-400" /> },
                                { stage: "Logs. Pendiente", val: data?.statusFunnel?.filter((s: any) => s.shipping_status === 'unpacked').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <Truck className="text-blue-400" /> },
                                { stage: "Cancelados", val: data?.statusFunnel?.filter((s: any) => s.status === 'cancelled').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0, icon: <XCircle className="text-red-400" /> }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="text-2xl">{item.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400">{item.stage}</p>
                                        {loading ? <Skeleton className="w-20 h-6 mt-1" /> : <p className="text-2xl font-black">{item.val} pedidos</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mt-12 p-8 rounded-[2.5rem] bg-blue-600 text-white shadow-xl shadow-blue-500/20">
                        <p className="font-black text-sm uppercase mb-4 tracking-widest">Tip de Optimización</p>
                        <p className="text-blue-100 text-xs font-bold leading-relaxed">
                            Vemos un cuello de botella en los pagos pendientes. Considera agregar recordatorios automáticos de carrito.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
