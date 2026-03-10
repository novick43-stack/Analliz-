"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import DateRangePicker from "@/components/analytics/DateRangePicker";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";
import { Package, AlertTriangle, LayoutDashboard, Search, ChevronLeft, ChevronRight, CheckCircle2, XCircle, TrendingUp, DollarSign, Layers } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

// ─────────────────────────────────────────
// Types
// ─────────────────────────────────────────
interface ParetoItem {
    product_id: string;
    name: any;
    sold_quantity: string | number;
    total_revenue: number;
    cumulative_revenue: number;
    grand_total: number;
    cumulative_percentage: number;
}
interface Product {
    id: string;
    name: any; // JSONB
    published: boolean;
    variant_count: string | number;
}

interface ProductosData {
    productList: Product[];
    paretoData: ParetoItem[];
    health?: {
        total_inventory_value: number;
        total_stock: number;
        total_products: number;
        avg_days_inventory: number;
    };
    adminDomain?: string;
    [key: string]: any;
}

export default function ProductosAnalyticsPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<ProductosData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [range, setRange] = useState<{ from: string; to: string } | null>(null);

    // UI Local State
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const isDark = theme === "dark";

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let url = "/api/analytics/productos";
            if (range) url += `?from=${range.from}&to=${range.to}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (e: any) {
            setError(e.message);
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

    // Derived Data
    const getProductName = (nameObj: any) => {
        if (!nameObj) return "N/A";
        if (typeof nameObj === "string") return nameObj;
        return nameObj.es || nameObj.en || nameObj.pt || Object.values(nameObj)[0] || "Producto sin nombre";
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const filteredProducts = data?.productList?.filter(p => {
        const matchesSearch = getProductName(p.name).toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'active' && p.published)
            || (statusFilter === 'inactive' && !p.published);
        return matchesSearch && matchesStatus;
    }) || [];

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <Package className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">
                            Catálogo de Productos
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] font-bold uppercase tracking-widest">
                            Gestión & Analítica
                        </span>
                    </div>
                </div>
                <DateRangePicker onRangeChange={handleRangeChange} />
            </div>

            {/* Resumen KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <DollarSign className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Valor Total del Stock</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">
                        {loading ? "..." : formatCurrency(data?.health?.total_inventory_value || 0)}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Package className="w-12 h-12 text-accent" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Productos en Catálogo</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">
                        {loading ? "..." : data?.productList?.length || 0}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unidades Vendidas (Periodo)</p>
                    <p className="text-3xl font-black text-foreground tabular-nums">
                        {loading ? "..." : data?.summary?.totalSold || 0}
                    </p>
                </div>
                <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                        <Layers className="w-12 h-12 text-orange-500" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ventas Totales (Periodo)</p>
                    <p className="text-3xl font-black text-foreground tabular-nums text-accent">
                        {loading ? "..." : formatCurrency(data?.summary?.total_revenue || 0)}
                    </p>
                </div>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Top Revenue Chart */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-accent mb-1">Rendimiento</p>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Top 10 por Facturación</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        {loading ? (
                            <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.paretoData?.slice(0, 10) || []}
                                    layout="vertical"
                                    margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? "#333" : "#eee"} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="product_id"
                                        type="category"
                                        width={100}
                                        tick={{ fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(id) => {
                                            const p = data?.paretoData?.find(item => item.product_id === id);
                                            const name = getProductName(p?.name);
                                            return name.length > 15 ? name.substring(0, 15) + '...' : name;
                                        }}
                                        stroke={isDark ? "#666" : "#999"}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDark ? "#1a1a1a" : "#fff", borderColor: isDark ? "#333" : "#eee", borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelClassName="hidden"
                                        formatter={(value: any, name: any, props: any) => [formatCurrency(value), getProductName(props.payload.name)]}
                                    />
                                    <Bar dataKey="total_revenue" radius={[0, 4, 4, 0]} barSize={20}>
                                        {(data?.paretoData?.slice(0, 10) || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#E00000' : index < 3 ? '#ff4d4d' : '#ff9999'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {/* Top Quantity Chart */}
                <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-xl flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-1">Volumen</p>
                            <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Top 10 por Unidades</h3>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="h-[350px] w-full">
                        {loading ? (
                            <div className="w-full h-full bg-muted/20 animate-pulse rounded-2xl" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={data?.paretoData?.slice(0, 10).sort((a, b) => Number(b.sold_quantity) - Number(a.sold_quantity)) || []}
                                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#333" : "#eee"} />
                                    <XAxis
                                        dataKey="product_id"
                                        tick={{ fontSize: 9, fontWeight: 900 }}
                                        tickFormatter={(id) => {
                                            const p = data?.paretoData?.find(item => item.product_id === id);
                                            const name = getProductName(p?.name);
                                            return name.length > 8 ? name.substring(0, 8) + '...' : name;
                                        }}
                                        stroke={isDark ? "#666" : "#999"}
                                    />
                                    <YAxis stroke={isDark ? "#666" : "#999"} tick={{ fontSize: 10 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: isDark ? "#1a1a1a" : "#fff", border: 'none', borderRadius: '1rem', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        labelClassName="hidden"
                                        formatter={(value: any, name: any, props: any) => [value + ' unidades', getProductName(props.payload.name)]}
                                    />
                                    <Bar dataKey="sold_quantity" radius={[4, 4, 0, 0]} barSize={40}>
                                        {(data?.paretoData?.slice(0, 10) || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : index < 3 ? '#34d399' : '#a7f3d0'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-col gap-6">
                {/* Search & Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-3xl border border-border shadow-sm">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Buscar producto..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="w-full pl-12 pr-4 py-3 bg-muted/50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/50 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border">
                            {(['all', 'active', 'inactive'] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                    className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                                        ? 'bg-card text-accent shadow-sm ring-1 ring-border'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {s === 'all' ? 'Todos' : s === 'active' ? 'Activos' : 'Inactivos'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="bg-card rounded-[2.5rem] border border-border shadow-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest">Nombre del Producto</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Variantes</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-center">Estado</th>
                                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-8 py-6"><Skeleton className="h-5 w-48" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-5 w-12 mx-auto" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-5 w-20 mx-auto" /></td>
                                            <td className="px-8 py-6"><Skeleton className="h-5 w-8 ml-auto" /></td>
                                        </tr>
                                    ))
                                ) : paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-8 py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-40">
                                                <Package className="w-12 h-12" />
                                                <p className="font-black uppercase tracking-widest text-xs">No se encontraron productos</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors group">
                                            <td className="px-8 py-6">
                                                <span className="font-bold text-foreground text-sm uppercase tracking-tight group-hover:text-accent transition-colors">
                                                    {getProductName(p.name)}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-center tabular-nums">
                                                <div className="inline-flex items-center justify-center px-4 py-1.5 bg-muted rounded-full text-xs font-black text-foreground">
                                                    {p.variant_count}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.published
                                                    ? 'bg-emerald-500/10 text-emerald-500'
                                                    : 'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {p.published ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                                                    {p.published ? 'Activo' : 'Inactivo'}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right flex justify-end gap-2">
                                                {data?.adminDomain && (
                                                    <a
                                                        href={`https://${data.adminDomain}/admin/products/${p.id}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2.5 rounded-xl bg-accent text-white hover:bg-black transition-all shadow-sm"
                                                        title="Ver en TiendaNube"
                                                    >
                                                        <Package className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-muted/20 border-t border-border px-8 py-5 flex items-center justify-between">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Página {currentPage} de {totalPages} • {filteredProducts.length} productos
                            </p>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-xl bg-card border border-border disabled:opacity-30 hover:border-accent transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-xl bg-card border border-border disabled:opacity-30 hover:border-accent transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error state */}
            {error && (
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-[2rem] p-6 flex items-center gap-4">
                    <AlertTriangle className="w-8 h-8 text-rose-500 shrink-0" />
                    <div>
                        <p className="font-black text-rose-500 uppercase text-xs tracking-widest">Error al cargar datos</p>
                        <p className="text-sm text-muted-foreground mt-1">{error}</p>
                    </div>
                </div>
            )}
        </section>
    );
}
