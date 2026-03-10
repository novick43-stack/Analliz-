"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import Skeleton from "@/components/ui/Skeleton";
import { useTheme } from "next-themes";
import {
    Package,
    AlertTriangle,
    Search,
    ChevronLeft,
    ChevronRight,
    PackageCheck,
    PackageX,
    TrendingUp,
    DollarSign,
    BarChart3,
    Zap,
    Info,
    ArrowRight,
    RefreshCcw,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    CheckCircle2,
    XCircle
} from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";

interface Variant {
    id: string;
    values: any;
    stock: number;
    price: number;
    sku: string | null;
}

interface Product {
    id: string;
    name: any;
    published: boolean;
    variant_count: string | number;
    total_stock: number;
    units_sold_30d: number;
    daily_velocity: number;
    days_to_stockout: number | null;
    variants: Variant[];
}

interface StockData {
    health: {
        total_inventory_value: number;
        total_stock: number;
        total_products: number;
        out_of_stock: number;
        critical_risk: number;
        low_stock: number;
    };
    productList: Product[];
    adminDomain?: string;
    error?: string;
}

export default function StockManagementPage() {
    const { theme } = useTheme();
    const [data, setData] = useState<StockData | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('active');
    const [stockFilter, setStockFilter] = useState<'all' | 'out' | 'risk' | 'low' | 'healthy'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
    const ITEMS_PER_PAGE = 12;

    const isDark = theme === "dark";

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/analytics/stock");
            const json = await res.json();
            setData(json);
        } catch (e) {
            console.error("Error fetching stock data:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount || 0);
    };

    const getProductName = (nameObj: any) => {
        if (!nameObj) return "N/A";
        if (typeof nameObj === "string") return nameObj;
        return nameObj.es || nameObj.en || nameObj.pt || Object.values(nameObj)[0] || "Producto sin nombre";
    };

    const getVariantName = (values: any) => {
        if (!values || !Array.isArray(values)) return "Única";
        return values.map((v: any) => {
            const val = v.es || v.en || v.pt || (typeof v === 'object' ? Object.values(v)[0] : v);
            return val;
        }).join(" / ");
    };

    const getStockStatus = (stock: number, daysToStockout: number | null) => {
        if (stock <= 0) return { label: 'Sin Stock', color: 'text-rose-500', bg: 'bg-rose-500/10', border: 'border-rose-500/20', status: 'out', icon: <PackageX className="w-4 h-4" /> };
        if (daysToStockout !== null && daysToStockout < 7) return { label: 'Riesgo Crítico', color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', status: 'risk', icon: <AlertTriangle className="w-4 h-4" /> };
        if (daysToStockout !== null && daysToStockout < 15) return { label: 'Atención', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20', status: 'low', icon: <Info className="w-4 h-4" /> };
        return { label: 'Saludable', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', status: 'healthy', icon: <PackageCheck className="w-4 h-4" /> };
    };

    const toggleExpand = (productId: string) => {
        const newExpanded = new Set(expandedProducts);
        if (newExpanded.has(productId)) {
            newExpanded.delete(productId);
        } else {
            newExpanded.add(productId);
        }
        setExpandedProducts(newExpanded);
    };

    const filteredProducts = data?.productList?.filter(p => {
        const name = getProductName(p.name).toLowerCase();
        const matchesSearch = name.includes(searchTerm.toLowerCase());

        // Robust boolean check for published status
        const isPublished = p.published === true || String(p.published).toLowerCase() === 't' || String(p.published).toLowerCase() === 'true';

        const matchesStatus = statusFilter === 'all'
            || (statusFilter === 'active' && isPublished)
            || (statusFilter === 'inactive' && !isPublished);

        const stockInfo = getStockStatus(Number(p.total_stock || 0), p.days_to_stockout);
        const matchesStock = stockFilter === 'all' || stockInfo.status === stockFilter;

        return matchesSearch && matchesStatus && matchesStock;
    }) || [];

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const healthDistribution = (data && data.health) ? [
        { name: 'Sin Stock', value: Number(data.health.out_of_stock || 0), color: '#f43f5e' },
        { name: 'Riesgo Crítico', value: Number(data.health.critical_risk || 0), color: '#f97316' },
        { name: 'En Alerta', value: Number(data.health.low_stock || 0), color: '#f59e0b' },
        { name: 'Saludable', value: Math.max(0, Number(data.health.total_products || 0) - Number(data.health.out_of_stock || 0) - Number(data.health.critical_risk || 0) - Number(data.health.low_stock || 0)), color: '#10b981' }
    ].filter(d => d.value > 0) : [];

    return (
        <section className="flex flex-col gap-8 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center">
                            <Zap className="w-6 h-6" />
                        </div>
                        <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Gestión de Stock</h2>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Reposición & Pronóstico Lineal</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchData} className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent hover:text-white transition-all shadow-sm">
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Macro Health Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* KPI Cards */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <DollarSign className="w-16 h-16 text-emerald-500" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Valor de Inventario</p>
                        <h3 className="text-4xl font-black text-foreground tabular-nums">
                            {loading ? <Skeleton className="h-10 w-32" /> : formatCurrency(data?.health?.total_inventory_value || 0)}
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1 uppercase">Capital Inmovilizado</p>
                    </div>

                    <div className="bg-card p-8 rounded-[2.5rem] border border-border shadow-sm flex flex-col justify-between relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
                            <Package className="w-16 h-16 text-accent" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Unidades Totales</p>
                        <h3 className="text-4xl font-black text-foreground tabular-nums">
                            {loading ? <Skeleton className="h-10 w-24" /> : data?.health?.total_stock || 0}
                        </h3>
                        <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">{data?.health?.total_products || 0} SKUs Distintos</p>
                    </div>

                    <div className="bg-rose-500/5 p-8 rounded-[2.5rem] border border-rose-500/10 shadow-sm flex flex-col justify-between group">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 mb-1">Stock Agotado</p>
                        <div className="flex items-center gap-4">
                            <h3 className="text-4xl font-black text-rose-500 tabular-nums">
                                {loading ? <Skeleton className="h-10 w-16" /> : data?.health?.out_of_stock || 0}
                            </h3>
                            <div className="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center animate-pulse">
                                <PackageX className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-rose-500/60 mt-2 uppercase tracking-tight">Acción Inmediata Requerida</p>
                    </div>

                    <div className="bg-orange-500/5 p-8 rounded-[2.5rem] border border-orange-500/10 shadow-sm flex flex-col justify-between group">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Riesgo de Quiebre</p>
                        <div className="flex items-center gap-4">
                            <h3 className="text-4xl font-black text-orange-500 tabular-nums">
                                {loading ? <Skeleton className="h-10 w-16" /> : data?.health?.critical_risk || 0}
                            </h3>
                            <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
                                <AlertTriangle className="w-5 h-5" />
                            </div>
                        </div>
                        <p className="text-[10px] font-bold text-orange-500/60 mt-2 uppercase tracking-tight">Menos de 7 días restantes</p>
                    </div>
                </div>

                {/* Health Chart */}
                <div className="bg-card p-8 rounded-[3rem] border border-border shadow-xl flex flex-col gap-6 relative overflow-hidden">
                    <div className="flex flex-col gap-1">
                        <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Estado de Salud</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Distribución del Catálogo</p>
                    </div>

                    <div className="flex-1 min-h-[220px] relative">
                        {loading ? (
                            <Skeleton className="w-full h-full rounded-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={healthDistribution}
                                        innerRadius={65}
                                        outerRadius={85}
                                        paddingAngle={6}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {healthDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <ReTooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        )}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Total SKUs</span>
                            <span className="text-2xl font-black text-foreground">{data?.health?.total_products || 0}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pb-2">
                        {healthDistribution.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Predictive Management Table */}
            <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 bg-card p-5 rounded-3xl border border-border shadow-lg">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                            <input
                                type="text"
                                placeholder="Buscar producto a reponer..."
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-12 pr-4 py-3 bg-muted/30 border border-transparent rounded-2xl text-sm font-bold focus:ring-2 focus:ring-accent/50 focus:bg-card focus:border-border outline-none transition-all placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border">
                                {(['all', 'active', 'inactive'] as const).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => { setStatusFilter(s); setCurrentPage(1); }}
                                        className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === s
                                            ? 'bg-card text-accent shadow-sm ring-1 ring-border'
                                            : 'text-muted-foreground hover:text-foreground'
                                            }`}
                                    >
                                        {s === 'all' ? 'Ver Todos' : s === 'active' ? 'Tienda: Visibles' : 'Tienda: Ocultos'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
                        {(['all', 'out', 'risk', 'low', 'healthy'] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => { setStockFilter(s); setCurrentPage(1); }}
                                className={`px-4 py-2.5 rounded-xl text-[8px] font-black uppercase tracking-[0.15em] transition-all ${stockFilter === s
                                    ? 'bg-accent text-white shadow-xl shadow-accent/30'
                                    : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {s === 'all' ? 'Filtrar por Salud' : s === 'out' ? 'Sin Stock' : s === 'risk' ? 'Riesgo Crítico' : s === 'low' ? 'Atención' : 'Sano'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-card rounded-[3rem] border border-border shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-muted/30 text-muted-foreground border-b border-border">
                                    <th className="w-12 px-4 py-6"></th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Producto / Catálogo</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Variantes</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Stock Actual</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Velocidad (Un/Día)</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Días Restantes</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Estado Salud</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="w-12"></td>
                                            <td className="px-8 py-7"><Skeleton className="h-5 w-48" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-5 w-12 mx-auto" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-5 w-12 mx-auto" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-5 w-12 mx-auto" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-5 w-12 mx-auto" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-6 w-24 mx-auto rounded-full" /></td>
                                            <td className="px-8 py-7"><Skeleton className="h-8 w-8 ml-auto rounded-lg" /></td>
                                        </tr>
                                    ))
                                ) : paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-8 py-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                                    <PackageX className="w-10 h-10 text-muted-foreground/30" />
                                                </div>
                                                <p className="font-black uppercase tracking-[0.2em] text-sm text-muted-foreground/50">Sin resultados para esta búsqueda</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((p) => {
                                        const stockInfo = getStockStatus(Number(p.total_stock || 0), p.days_to_stockout);
                                        const isExpanded = expandedProducts.has(p.id);
                                        return (
                                            <>
                                                <tr key={p.id} className={`hover:bg-muted/20 transition-all duration-300 group cursor-pointer ${isExpanded ? 'bg-muted/10' : ''}`} onClick={() => toggleExpand(p.id)}>
                                                    <td className="w-12 px-4 py-6 text-center">
                                                        {isExpanded ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col max-w-[300px]">
                                                            <span className="font-black text-foreground text-[13px] uppercase tracking-tight truncate group-hover:text-accent transition-colors">
                                                                {getProductName(p.name)}
                                                            </span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${p.published ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' : 'text-muted-foreground/40 border-muted-foreground/10 bg-muted/30'}`}>
                                                                    {p.published ? 'Visible' : 'Oculto'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center tabular-nums">
                                                        <div className="inline-flex items-center justify-center px-3 py-1 bg-muted rounded-lg text-[11px] font-black text-foreground">
                                                            {p.variant_count}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-center tabular-nums font-black text-sm">
                                                        <span className={Number(p.total_stock) <= 0 ? 'text-rose-500' : 'text-foreground'}>
                                                            {p.total_stock}
                                                        </span>
                                                    </td>
                                                    <td className="px-8 py-6 text-center tabular-nums text-xs font-bold text-muted-foreground">
                                                        {Number(p.daily_velocity).toFixed(2)}
                                                    </td>
                                                    <td className="px-8 py-6 text-center tabular-nums">
                                                        {p.days_to_stockout !== null ? (
                                                            <div className={`text-[13px] font-black flex flex-col items-center leading-tight ${p.days_to_stockout < 7 ? 'text-rose-500' :
                                                                p.days_to_stockout < 15 ? 'text-orange-500' :
                                                                    'text-emerald-500'
                                                                }`}>
                                                                <span>~{Math.ceil(p.days_to_stockout)}</span>
                                                                <span className="text-[9px] uppercase tracking-tighter">días</span>
                                                            </div>
                                                        ) : (
                                                            <div className="text-xs font-bold text-muted-foreground/20 italic">Sin ritmo</div>
                                                        )}
                                                    </td>
                                                    <td className="px-8 py-6 text-center">
                                                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${stockInfo.color} ${stockInfo.bg} ${stockInfo.border} shadow-sm`}>
                                                            {stockInfo.icon}
                                                            {stockInfo.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {data?.adminDomain && (
                                                            <a
                                                                href={`https://${data.adminDomain}/admin/products/${p.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-accent/10 text-accent hover:bg-accent hover:text-white font-black text-[10px] uppercase tracking-widest transition-all group-hover:scale-105"
                                                            >
                                                                Reponer
                                                                <ArrowRight className="w-3 h-3" />
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                                {isExpanded && p.variants && p.variants.length > 0 && (
                                                    <tr className="bg-muted/5">
                                                        <td colSpan={8} className="px-16 py-6 border-b border-border/20">
                                                            <div className="flex flex-col gap-4 animate-in slide-in-from-top-2 duration-300">
                                                                <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                                    <LayoutGrid className="w-3 h-3" />
                                                                    Desglose de Variantes ({p.variants.length})
                                                                </div>
                                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                                    {p.variants.map((v) => (
                                                                        <div key={v.id} className="bg-card p-4 rounded-2xl border border-border shadow-sm flex items-center justify-between group/variant">
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="text-[11px] font-black text-foreground uppercase tracking-tight">
                                                                                    {getVariantName(v.values)}
                                                                                </span>
                                                                                <span className="text-[9px] font-bold text-muted-foreground tracking-widest">{v.sku || 'S/ SKU'}</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-end">
                                                                                <span className={`text-base font-black tabular-nums ${v.stock <= 0 ? 'text-rose-500' : 'text-accent'}`}>{v.stock}</span>
                                                                                <span className="text-[8px] font-black uppercase tracking-tighter text-muted-foreground">Unidades</span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="bg-muted/10 border-t border-border/50 px-8 py-6 flex items-center justify-between">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Mostrando {paginatedProducts.length} SKU de {filteredProducts.length}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.max(1, p - 1)); }}
                                    disabled={currentPage === 1}
                                    className="p-3 rounded-xl bg-card border border-border disabled:opacity-30 hover:bg-muted transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-black text-foreground">{currentPage}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground">/</span>
                                    <span className="text-xs font-bold text-muted-foreground">{totalPages}</span>
                                </div>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => Math.min(totalPages, p + 1)); }}
                                    disabled={currentPage === totalPages}
                                    className="p-3 rounded-xl bg-card border border-border disabled:opacity-30 hover:bg-muted transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Legend & Help */}
                <div className="flex flex-col md:flex-row items-center gap-6 p-10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -translate-y-32 translate-x-32" />
                    <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl shadow-2xl shrink-0">📊</div>
                    <div className="flex-1 flex flex-col gap-2">
                        <p className="text-xs font-black uppercase tracking-widest text-accent/80 italic">¿Cómo funciona el pronóstico?</p>
                        <p className="text-sm font-medium leading-relaxed opacity-80">
                            El sistema monitorea tus ventas en tiempo real. Divide el stock actual por el promedio de ventas diarias de los últimos 30 días para calcular los <strong>Días de Inventario</strong> restantes. Si no has vendido el producto últimamente, el pronóstico se mantendrá pausado hasta detectar actividad.
                        </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-3 opacity-60">
                        <Zap className="w-5 h-5 text-accent animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Smart Stock Engine v1.0</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
