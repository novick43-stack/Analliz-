"use client";

import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, ComposedChart
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import FunnelChart from "@/components/analytics/FunnelChart";
import HeatmapChart from "@/components/analytics/HeatmapChart";
import { DollarSign, ShoppingBag, TrendingUp, RefreshCcw, CreditCard, Zap, ArrowUpRight, ArrowDownRight, Percent, Filter, Clock, Calendar, MapPin, Users as UsersIcon } from "lucide-react";
import Skeleton from "@/components/ui/Skeleton";

export default function VentasAnalyticsPage() {
    const [data, setData] = useState<any>(null);
    const [conversionData, setConversionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState<{ from: string, to: string } | null>(null);
    const [showRevenue, setShowRevenue] = useState(true);
    const [showOrders, setShowOrders] = useState(true);

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

    const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

    const funnelStages = [
        { name: "Total Pedidos", value: conversionData?.summary?.total_orders || 0 },
        {
            name: "Pagados",
            value: conversionData?.statusFunnel?.filter((s: any) => s.payment_status === 'paid').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        },
        {
            name: "Enviados",
            value: conversionData?.statusFunnel?.filter((s: any) => s.shipping_status === 'shipped' || s.shipping_status === 'delivered').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        },
        {
            name: "Finalizados",
            value: conversionData?.statusFunnel?.filter((s: any) => s.status === 'closed').reduce((acc: number, s: any) => acc + Number(s.count), 0) || 0
        }
    ];

    const kpis = [
        {
            label: "Facturación Total",
            val: formatCurrency(data?.kpis?.total_revenue),
            prev: data?.prevKpis?.total_revenue,
            icon: <DollarSign />,
            color: "emerald"
        },
        {
            label: "Cantidad de Órdenes",
            val: data?.kpis?.total_orders || 0,
            prev: data?.prevKpis?.total_orders,
            icon: <ShoppingBag />,
            color: "blue"
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

    return (
        <section className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Ventas</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest">Performance</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Resumen del período */}
            <div className="bg-[#f0f9f9] rounded-[2.5rem] p-8 border border-[#e0f2f2]">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                            <Calendar className="w-5 h-5 text-gray-700" />
                        </div>
                        <h3 className="text-xl font-black text-gray-800 uppercase italic">Resumen del período</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <Zap className="w-5 h-5 text-gray-400" />
                        <RefreshCcw className="w-4 h-4 text-gray-300" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[
                        { label: "ventas", val: data?.kpis?.total_orders || 0 },
                        { label: "por día", val: formatCurrency(revenuePerDay) },
                        { label: "total facturado", val: formatCurrency(data?.kpis?.total_revenue) },
                        { label: "por venta (ticket promedio)", val: formatCurrency(data?.kpis?.average_ticket) }
                    ].map((kpi, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border-t-4 border-[#81e6d9]">
                            {loading ? <Skeleton className="w-24 h-8 mb-4" /> : <p className="text-4xl font-black text-gray-900 mb-4">{kpi.val}</p>}
                            <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{kpi.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Main KPIs with deltas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpis.map((kpi, i) => {
                    const delta = calculateDelta(kpi.val, kpi.prev);
                    return (
                        <div key={i} className="bg-white rounded-[1.5rem] p-5 border border-gray-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="flex items-center justify-between">
                                <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center text-xl group-hover:scale-110 transition-transform`}>
                                    {kpi.icon}
                                </div>
                                {loading ? (
                                    <Skeleton className="w-10 h-4" />
                                ) : (
                                    <div className={`flex items-center gap-1 text-[10px] font-bold ${delta >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                        {delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {Math.abs(delta).toFixed(1)}%
                                    </div>
                                )}
                            </div>
                            <div>
                                <p className="text-gray-400 font-bold text-[9px] uppercase tracking-wider mb-1">{kpi.label}</p>
                                {loading ? <Skeleton className="w-24 h-6" /> : <h3 className="text-2xl font-black text-gray-900 tracking-tight">{kpi.val}</h3>}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Revenue & Orders Evolution */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm overflow-hidden relative group">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900 italic uppercase">Evolución de Ventas</h3>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Comparativa de ingresos vs cantidad de pedidos</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-gray-100 p-1 rounded-xl">
                            <button
                                onClick={() => setShowRevenue(!showRevenue)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showRevenue ? 'bg-white text-blue-600 shadow-sm font-black' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Ingresos
                            </button>
                            <button
                                onClick={() => setShowOrders(!showOrders)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showOrders ? 'bg-white text-indigo-600 shadow-sm font-black' : 'text-gray-400 hover:text-gray-600'}`}
                            >
                                Pedidos
                            </button>
                        </div>
                    </div>
                </div>

                <div className="h-[300px] w-full">
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
                            <ComposedChart data={data?.revenueOverTime || []}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => str ? format(new Date(str), "d MMM", { locale: es }) : ""}
                                    axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }} minTickGap={40}
                                />
                                {showRevenue && (
                                    <YAxis
                                        yAxisId="left"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                        tickFormatter={(v) => `$${v / 1000}k`}
                                    />
                                )}
                                {showOrders && (
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#6366f1', fontSize: 10, fontWeight: 800 }}
                                    />
                                )}
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)' }}
                                    itemStyle={{ fontWeight: 800 }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '8px' }}
                                    formatter={(value: any, name?: string) => {
                                        if (name === "Ingresos") return [formatCurrency(value), name];
                                        return [value, name || ""];
                                    }}
                                />
                                {showOrders && <Bar yAxisId="right" dataKey="orders" name="Pedidos" fill="#6366f1" radius={[4, 4, 0, 0]} opacity={0.6} barSize={32} />}
                                {showRevenue && <Area yAxisId="left" type="monotone" dataKey="revenue" name="Ingresos" stroke="#3b82f6" strokeWidth={6} fill="url(#colorRev)" />}
                            </ComposedChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>

            {/* Sales Heatmap */}
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
                        <Clock />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-gray-900 italic uppercase">Picos de Venta por Hora</h3>
                        <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Análisis de actividad horaria</p>
                    </div>
                </div>
                {loading ? <Skeleton className="w-full h-[400px]" /> : <HeatmapChart data={data?.salesByDayHour || []} loading={loading} />}
            </div>

            {/* Demographics: Provinces & Age */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Provinces Donut */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl shadow-sm">
                                <MapPin />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 italic uppercase leading-none">Provincias</h3>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Distribución geográfica</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full flex flex-col items-center justify-center">
                        {loading ? <Skeleton variant="circle" className="w-48 h-48" /> : (
                            <>
                                <ResponsiveContainer width="100%" height={220}>
                                    <PieChart>
                                        <Pie
                                            data={data?.salesByProvince || []}
                                            dataKey="revenue"
                                            nameKey="province"
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={5}
                                        >
                                            {(data?.salesByProvince || []).map((_: any, i: number) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="w-full mt-6 grid grid-cols-1 gap-2">
                                    {(data?.salesByProvince || []).slice(0, 5).map((p: any, i: number) => {
                                        const percentage = ((p.count / (data?.kpis?.total_orders || 1)) * 100).toFixed(1);
                                        return (
                                            <div key={i} className="flex items-center justify-between text-[11px] font-bold">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-3 h-3 rounded-md" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                                                    <span className="text-gray-700">{p.province}</span>
                                                    <span className="text-gray-400">({percentage}%)</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Age Area Chart */}
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-sm">
                                <UsersIcon />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-gray-900 italic uppercase leading-none">Edad</h3>
                                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest mt-1">Ventas por edad de los clientes</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[250px] w-full">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data?.salesByAge || []}>
                                    <defs>
                                        <linearGradient id="colorAge" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="age"
                                        stroke="#94a3b8"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={false}
                                        label={{ value: 'edad', position: 'insideBottom', offset: -5, fontSize: 10, fontWeight: 'bold' }}
                                    />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                        formatter={(value: any) => [`${value} pedidos`, 'Ventas']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAge)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>

                    <div className="mt-6 flex flex-col items-center gap-2">
                        {loading ? <Skeleton className="w-32 h-6" /> : <p className="text-lg font-black text-gray-800">Edad promedio: {data?.averageAge || 0} años</p>}
                        <p className="text-[9px] font-bold text-gray-400 text-center leading-relaxed">
                            Las edades se estiman a partir de la información de identificación cargada en las órdenes.
                        </p>
                    </div>
                </div>
            </div>

            {/* Methods & Funnel */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Dona de Pagos (Gateways) */}
                <div className="bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-2xl shadow-sm">
                            <CreditCard />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 italic uppercase">Dona de Pagos</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Control de Gateways y Comisiones</p>
                        </div>
                    </div>

                    <div className="flex-1 min-h-[300px] w-full flex items-center justify-center relative">
                        {loading ? <Skeleton variant="circle" className="w-56 h-56" /> : (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={data?.paymentMethods || []}
                                            dataKey="revenue"
                                            nameKey="method"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={8}
                                        >
                                            {(data?.paymentMethods || []).map((_: any, i: number) => (
                                                <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Gateway</span>
                                    <span className="text-xl font-black text-gray-900 leading-none">Share</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Embudo de Conversión */}
                <div className="bg-white rounded-[2rem] p-12 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-6 mb-12">
                        <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl shadow-sm">
                            <Filter />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 italic uppercase">Embudo de Ventas</h3>
                            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Órdenes según su estado</p>
                        </div>
                    </div>
                    <div className="flex-1 w-full min-h-[350px]">
                        {loading ? <Skeleton className="w-full h-full" /> : <FunnelChart data={funnelStages} />}
                    </div>
                </div>
            </div>

            {/* Impacto de Promos Section */}
            <div className="bg-gray-900 rounded-[3rem] p-16 shadow-2xl text-white">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-center">
                    <div className="lg:col-span-1">
                        <div className="flex items-center gap-6 mb-8">
                            <div className="w-20 h-20 rounded-[2rem] bg-blue-600 flex items-center justify-center text-4xl shadow-2xl shadow-blue-500/20">
                                <Zap />
                            </div>
                            <h3 className="text-4xl font-black italic uppercase leading-none">Promo<br /><span className="text-blue-500">Impact</span></h3>
                        </div>
                        <p className="text-blue-100/60 font-bold text-sm leading-relaxed mb-8">
                            Analizamos cómo influyen los cupones de descuento en tu facturación total y qué porcentaje de tus clientes los utilizan.
                        </p>
                        <div className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5">
                            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Tasa de Uso</p>
                            {loading ? <Skeleton className="w-24 h-12" /> : (
                                <p className="text-5xl font-black italic">
                                    {((data?.promoImpact?.find((p: any) => p.type === 'Promocional')?.count || 0) / (data?.kpis?.total_orders || 1) * 100).toFixed(1)}%
                                </p>
                            )}
                            <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-tighter">De tus pedidos totales</p>
                        </div>
                    </div>

                    <div className="lg:col-span-2 h-[350px]">
                        {loading ? <Skeleton className="w-full h-full" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data?.promoImpact || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 800 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ background: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px' }}
                                    />
                                    <Bar dataKey="revenue" radius={[20, 20, 0, 0]} barSize={120}>
                                        {(data?.promoImpact || []).map((entry: any, i: number) => (
                                            <Cell key={i} fill={entry.type === 'Promocional' ? '#3b82f6' : 'rgba(255,255,255,0.1)'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
