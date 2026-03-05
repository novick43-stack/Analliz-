"use client";

import { useEffect, useState, useCallback } from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import { Users, UserPlus, Heart, RefreshCcw, Mail, DollarSign, Target, MapPin, Zap, TrendingUp, ShoppingBag, Package, Calendar } from "lucide-react";

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

    const COLORS = ['#81e6d9', '#f6ad55', '#3b82f6', '#8b5cf6', '#ec4899'];

    const newPercent = data?.summary ? Math.round((data.summary.new_orders / (Number(data.summary.new_orders) + Number(data.summary.recurrent_orders) || 1)) * 100) : 0;
    const recurrentPercent = 100 - newPercent;

    return (
        <section className="flex flex-col gap-8 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="flex flex-col gap-2">
                    <h2 className="text-5xl font-black text-gray-900 tracking-tight leading-none italic uppercase">Radar de <span className="text-pink-600">Clientes</span></h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-pink-600 text-white text-[9px] font-black uppercase tracking-widest">Customer Intelligence</span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Top Row: Trend & Period Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Trend Chart */}
                <div className="lg:col-span-3 bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center text-xl">
                                <Users />
                            </div>
                            <h3 className="text-xl font-black text-gray-900 italic uppercase">Clientes nuevos y recurrentes</h3>
                        </div>
                    </div>
                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.trend || []} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(str) => str ? format(new Date(str), "d/M", { locale: es }) : ""}
                                    axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }}
                                />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }} />
                                <Bar dataKey="nuevos" name="Nuevos" fill="#81e6d9" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="recurrentes" name="Recurrentes" fill="#f6ad55" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Resumen del Período KPI Grid */}
                <div className="lg:col-span-1 bg-[#f0f9f9] rounded-[2.5rem] p-6 border border-[#e0f2f2] flex flex-col gap-6">
                    <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-gray-700" />
                        <h3 className="text-sm font-black text-gray-800 uppercase italic">Resumen del período</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{data?.summary?.new_orders || 0}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase leading-tight mt-1">compras - clientes nuevos</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{data?.summary?.recurrent_orders || 0}</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase leading-tight mt-1">compras - clientes recurrentes</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{newPercent}%</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">nuevos</p>
                        </div>
                        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                            <p className="text-2xl font-black text-gray-900">{recurrentPercent}%</p>
                            <p className="text-[8px] font-bold text-gray-400 uppercase mt-1">recurrentes</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Orders Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-black text-gray-900 uppercase italic">Compras</h3>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Cantidad de clientes según cuántas compras realizaron</p>
                    </div>

                    <div className="h-[250px] flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data?.frequencyDist || []}
                                    dataKey="value"
                                    nameKey="label"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                >
                                    {(data?.frequencyDist || []).map((_: any, i: number) => (
                                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Frecuencia</span>
                            <span className="text-lg font-black text-gray-900">Orders</span>
                        </div>
                    </div>
                </div>

                {/* Product Variety Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-black text-gray-900 uppercase italic">Productos</h3>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Cantidad de clientes según cuántos productos compraron</p>
                    </div>

                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.varietyDist || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#81e6d9" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Spending Tiers Distribution */}
                <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="w-4 h-4 text-gray-400" />
                            <h3 className="text-sm font-black text-gray-900 uppercase italic">Valor de las compras</h3>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Cantidad de clientes según el valor total ($) invertido</p>
                    </div>

                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data?.valueDist || []}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 800, fill: '#94a3b8' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#94a3b8' }} />
                                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </section>
    );
}
