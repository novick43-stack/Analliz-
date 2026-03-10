"use client";

import React, { useEffect, useState } from "react";
import Skeleton from "@/components/ui/Skeleton";
import {
    Plus, Trash2, Save, ShoppingBag,
    DollarSign, TrendingDown, Percent,
    ArrowRight, Package, Search, AlertCircle,
    ChevronRight, ChevronDown
} from "lucide-react";

interface GeneralCost {
    id: string;
    type: 'fijo' | 'variable' | 'comision';
    category: string;
    amount: number;
    start_date: string;
    end_date: string;
}

interface ProductCost {
    product_id: string;
    product_name: any;
    variant_id: string;
    sku: string;
    price: string;
    cost_price: string;
    updated_at: string;
}

export default function CostosPage() {
    const [activeTab, setActiveTab] = useState<'generales' | 'productos'>('generales');
    const [loading, setLoading] = useState(true);

    // General Costs State
    const [generalCosts, setGeneralCosts] = useState<GeneralCost[]>([]);
    const [isAddingGeneral, setIsAddingGeneral] = useState(false);
    const [newGeneralCost, setNewGeneralCost] = useState<Partial<GeneralCost>>({
        type: 'fijo',
        category: '',
        amount: 0,
        start_date: '',
        end_date: ''
    });

    // Product Costs State
    const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [savingProductId, setSavingProductId] = useState<string | null>(null);
    const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());


    const fetchGeneralCosts = async () => {
        try {
            const res = await fetch(`/api/costs`);
            const data = await res.json();
            setGeneralCosts(Array.isArray(data) ? data : []);
        } catch (e) {
            setGeneralCosts([]);
        }
    };

    const fetchProductCosts = async () => {
        try {
            const res = await fetch(`/api/costs/products`);
            const data = await res.json();

            // Handle both array (legacy/simple) and object (with metadata) formats
            if (Array.isArray(data)) {
                setProductCosts(data);
            } else if (data && data.products && Array.isArray(data.products)) {
                setProductCosts(data.products);
            } else {
                setProductCosts([]);
            }
        } catch (e) {
            setProductCosts([]);
        }
    };


    useEffect(() => {
        setLoading(true);
        if (activeTab === 'generales') {
            fetchGeneralCosts().finally(() => setLoading(false));
        } else {
            fetchProductCosts().finally(() => setLoading(false));
        }
    }, [activeTab]);

    const handleSaveGeneral = async () => {
        try {
            const res = await fetch('/api/costs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newGeneralCost)
            });
            if (res.ok) {
                setIsAddingGeneral(false);
                setNewGeneralCost({ type: 'fijo', category: '', amount: 0, start_date: '', end_date: '' });
                fetchGeneralCosts();
            }
        } catch (e) {
            console.log("Error saving general cost:", e);
        }
    };

    const handleDeleteGeneral = async (id: string) => {
        try {
            const res = await fetch(`/api/costs?id=${id}`, { method: 'DELETE' });
            if (res.ok) fetchGeneralCosts();
        } catch (e) {
            console.log("Error deleting general cost:", e);
        }
    };

    const handleUpdateProductCost = async (variantId: string, productId: string, costPrice: number) => {
        setSavingProductId(variantId);
        try {
            const res = await fetch('/api/costs/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ variant_id: variantId, product_id: productId, cost_price: costPrice })
            });
            if (res.ok) {
                // Update local state
                setProductCosts(prev => Array.isArray(prev) ? prev.map(p =>
                    p.variant_id === variantId ? { ...p, cost_price: costPrice.toString() } : p
                ) : []);
            }
        } catch (e) {
            console.log("Error updating product cost:", e);
        } finally {
            setSavingProductId(null);
        }
    };

    const getProductName = (nameObj: any) => {
        if (!nameObj) return "N/A";
        if (typeof nameObj === "string") return nameObj;
        return nameObj.es || nameObj.en || nameObj.pt || Object.values(nameObj)[0] || "Producto sin nombre";
    };

    const formatCurrency = (val: number | string) => {
        const num = typeof val === 'string' ? parseFloat(val) : val;
        return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(num || 0);
    };

    const toggleProduct = (productId: string) => {
        setExpandedProducts(prev => {
            const next = new Set(prev);
            if (next.has(productId)) next.delete(productId);
            else next.add(productId);
            return next;
        });
    };

    const groupedProducts = Array.isArray(productCosts) ? productCosts.reduce((acc: any, p) => {
        const pid = p.product_id;
        if (!acc[pid]) {
            acc[pid] = {
                id: pid,
                name: p.product_name,
                variants: []
            };
        }
        acc[pid].variants.push(p);
        return acc;
    }, {}) : {};

    const productList = Object.values(groupedProducts).filter((p: any) =>
        getProductName(p.name).toLowerCase().includes(productSearch.toLowerCase()) ||
        p.variants.some((v: any) => v.sku?.toLowerCase().includes(productSearch.toLowerCase()))
    );

    return (
        <section className="flex flex-col gap-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
                <div className="flex flex-col gap-2">
                    <h2 className="text-4xl font-black text-foreground tracking-tight uppercase">Costos</h2>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest">
                            Estructura de Gastos
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border w-fit self-center">
                <button
                    onClick={() => setActiveTab('generales')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'generales'
                        ? 'bg-card text-foreground shadow-lg shadow-black/5 ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <DollarSign className="w-4 h-4" />
                    Gastos Generales
                </button>
                <button
                    onClick={() => setActiveTab('productos')}
                    className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'productos'
                        ? 'bg-card text-foreground shadow-lg shadow-black/5 ring-1 ring-border'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                >
                    <Package className="w-4 h-4" />
                    Costos de Producto
                </button>
            </div >

            {activeTab === 'generales' ? (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <DollarSign className="w-12 h-12 text-blue-500" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gastos Fijos</p>
                            <p className="text-3xl font-black text-foreground">
                                {formatCurrency(Array.isArray(generalCosts) ? generalCosts.filter(c => c.type === 'fijo').reduce((acc, c) => acc + Number(c.amount), 0) : 0)}
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <TrendingDown className="w-12 h-12 text-orange-500" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gastos Variables</p>
                            <p className="text-3xl font-black text-foreground">
                                {formatCurrency(Array.isArray(generalCosts) ? generalCosts.filter(c => c.type === 'variable').reduce((acc, c) => acc + Number(c.amount), 0) : 0)}
                            </p>
                        </div>
                        <div className="bg-card p-6 rounded-[2rem] border border-border shadow-sm flex flex-col gap-1 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Percent className="w-12 h-12 text-accent" />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Comisiones</p>
                            <p className="text-3xl font-black text-foreground">
                                {formatCurrency(Array.isArray(generalCosts) ? generalCosts.filter(c => c.type === 'comision').reduce((acc, c) => acc + Number(c.amount), 0) : 0)}
                            </p>
                        </div>
                    </div>

                    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border flex items-center justify-between bg-muted/30">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Registro de Gastos</h3>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Imputación manual de egresos</p>
                            </div>
                            <button
                                onClick={() => setIsAddingGeneral(true)}
                                className="flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                Agregar Costo
                            </button>
                        </div>

                        {isAddingGeneral && (
                            <div className="p-8 bg-muted/20 border-b border-border animate-in slide-in-from-top-4 duration-300">
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tipo</label>
                                        <select
                                            value={newGeneralCost.type}
                                            onChange={(e) => setNewGeneralCost({ ...newGeneralCost, type: e.target.value as any })}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                                        >
                                            <option value="fijo">Fijo</option>
                                            <option value="variable">Variable</option>
                                            <option value="comision">Comisión</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2 md:col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Categoría / Concepto</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Alquiler, Publicidad..."
                                            value={newGeneralCost.category}
                                            onChange={(e) => setNewGeneralCost({ ...newGeneralCost, category: e.target.value })}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Monto (ARS)</label>
                                        <input
                                            type="number"
                                            placeholder="0"
                                            value={newGeneralCost.amount || ''}
                                            onChange={(e) => setNewGeneralCost({ ...newGeneralCost, amount: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Desde</label>
                                        <input
                                            type="date"
                                            value={newGeneralCost.start_date}
                                            onChange={(e) => setNewGeneralCost({ ...newGeneralCost, start_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Hasta</label>
                                        <input
                                            type="date"
                                            value={newGeneralCost.end_date}
                                            onChange={(e) => setNewGeneralCost({ ...newGeneralCost, end_date: e.target.value })}
                                            className="w-full px-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-6">
                                    <button
                                        onClick={() => setIsAddingGeneral(false)}
                                        className="px-6 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleSaveGeneral}
                                        className="px-8 py-3 bg-accent text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-lg active:scale-95"
                                    >
                                        Guardar Registro
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest">Tipo</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-left">Concepto</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Monto</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-center">Vigencia</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={5} className="px-8 py-4"><Skeleton className="h-6 w-full" /></td>
                                            </tr>
                                        ))
                                    ) : !Array.isArray(generalCosts) || generalCosts.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-12 text-center text-muted-foreground font-bold italic">No hay costos registrados para este periodo.</td>
                                        </tr>
                                    ) : (
                                        generalCosts.map((cost) => (
                                            <tr key={cost.id} className="hover:bg-muted/30 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${cost.type === 'fijo' ? 'bg-blue-500/10 text-blue-500' :
                                                        cost.type === 'variable' ? 'bg-orange-500/10 text-orange-500' :
                                                            'bg-red-500/10 text-red-500'
                                                        }`}>
                                                        {cost.type}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <p className="text-sm font-black text-foreground uppercase tracking-tight">{cost.category}</p>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <p className="text-sm font-black text-foreground tabular-nums">{formatCurrency(cost.amount)}</p>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                                                        <span>{cost.start_date.split('T')[0]}</span>
                                                        <ArrowRight className="w-3 h-3 text-accent" />
                                                        <span>{cost.end_date.split('T')[0]}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDeleteGeneral(cost.id)}
                                                        className="p-2 text-muted-foreground hover:text-red-500 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-card rounded-[2.5rem] border border-border shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-muted/30 gap-6">
                            <div>
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Costo de Mercadería</h3>
                                <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-widest mt-1">Gestión unitaria por variante (SKU)</p>
                            </div>
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Buscar producto o SKU..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-xl text-xs font-bold focus:ring-2 focus:ring-accent outline-none"
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 text-muted-foreground border-b border-border">
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Producto & SKU</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Precio Venta</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Costo Unitario</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Markup (%)</th>
                                        <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-right">Margen (%)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {loading ? (
                                        Array(5).fill(0).map((_, i) => (
                                            <tr key={i}>
                                                <td colSpan={5} className="px-8 py-4"><Skeleton className="h-12 w-full" /></td>
                                            </tr>
                                        ))
                                    ) : productList.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="flex flex-col items-center gap-4">
                                                    <Package className="w-12 h-12 text-muted-foreground/20" />
                                                    <div className="flex flex-col gap-1">
                                                        <p className="text-muted-foreground font-black uppercase text-xs tracking-widest">No se encontraron productos</p>
                                                        <p className="text-muted-foreground/60 text-[10px] uppercase font-bold tracking-tight">Verificá que tengas productos cargados en tu tienda</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        productList.map((product: any) => {
                                            const isExpanded = expandedProducts.has(product.id);
                                            const hasMultipleVariants = product.variants.length > 1;

                                            return (
                                                <React.Fragment key={product.id}>
                                                    {/* Product Row */}
                                                    <tr
                                                        className={`hover:bg-muted/30 transition-colors group cursor-pointer ${isExpanded ? 'bg-muted/20' : ''}`}
                                                        onClick={() => hasMultipleVariants && toggleProduct(product.id)}
                                                    >
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                {hasMultipleVariants && (
                                                                    <div className="p-1 rounded-md bg-muted group-hover:bg-accent group-hover:text-white transition-colors">
                                                                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                                                    </div>
                                                                )}
                                                                <div className="flex flex-col gap-0.5">
                                                                    <p className="text-xs font-black text-foreground uppercase truncate">{getProductName(product.name)}</p>
                                                                    {!hasMultipleVariants && (
                                                                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                                                            SKU: {product.variants[0].sku || 'N/A'}
                                                                        </p>
                                                                    )}
                                                                    {hasMultipleVariants && (
                                                                        <p className="text-[9px] font-bold text-accent uppercase tracking-widest">
                                                                            {product.variants.length} Variantes
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right font-black text-xs text-muted-foreground">
                                                            {!hasMultipleVariants && formatCurrency(product.variants[0].price)}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {!hasMultipleVariants && (
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <span className="text-xs font-bold text-muted-foreground">$</span>
                                                                    <input
                                                                        type="number"
                                                                        defaultValue={product.variants[0].cost_price || ''}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                        onBlur={(e) => {
                                                                            const val = parseFloat(e.target.value);
                                                                            if (!isNaN(val) && val.toString() !== product.variants[0].cost_price) {
                                                                                handleUpdateProductCost(product.variants[0].variant_id, product.variants[0].product_id, val);
                                                                            }
                                                                        }}
                                                                        className="w-24 px-3 py-1.5 bg-muted/40 border-none rounded-lg text-sm font-black text-right outline-none focus:ring-1 focus:ring-accent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        placeholder="0"
                                                                    />
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {!hasMultipleVariants && (() => {
                                                                const price = parseFloat(product.variants[0].price);
                                                                const cost = parseFloat(product.variants[0].cost_price || '0');
                                                                const profit = price - cost;
                                                                const markup = cost > 0 ? (profit / cost) * 100 : 0;
                                                                return (
                                                                    <div className="flex flex-col items-end">
                                                                        <p className={`text-xs font-black ${markup > 50 ? 'text-emerald-500' : markup > 20 ? 'text-orange-500' : 'text-red-500'}`}>
                                                                            {markup.toFixed(1)}%
                                                                        </p>
                                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Markup</p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            {!hasMultipleVariants && (() => {
                                                                const price = parseFloat(product.variants[0].price);
                                                                const cost = parseFloat(product.variants[0].cost_price || '0');
                                                                const profit = price - cost;
                                                                const margin = price > 0 ? (profit / price) * 100 : 0;
                                                                return (
                                                                    <div className="flex flex-col items-end">
                                                                        <p className={`text-xs font-black ${margin > 30 ? 'text-emerald-500' : margin > 10 ? 'text-orange-500' : 'text-red-500'}`}>
                                                                            {margin.toFixed(1)}%
                                                                        </p>
                                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Margen</p>
                                                                    </div>
                                                                );
                                                            })()}
                                                        </td>
                                                    </tr>

                                                    {/* Variants Rows */}
                                                    {isExpanded && hasMultipleVariants && product.variants.map((v: any) => {
                                                        const price = parseFloat(v.price);
                                                        const cost = parseFloat(v.cost_price || '0');
                                                        const profit = price - cost;
                                                        const margin = price > 0 ? (profit / price) * 100 : 0;
                                                        const markup = cost > 0 ? (profit / cost) * 100 : 0;

                                                        return (
                                                            <tr key={v.variant_id} className="bg-muted/5 border-l-2 border-accent animate-in fade-in slide-in-from-left-2 duration-200">
                                                                <td className="px-8 py-4 pl-16">
                                                                    <div className="flex flex-col gap-0.5">
                                                                        <p className="text-[10px] font-black text-foreground uppercase tracking-tight">
                                                                            {v.sku || 'Variante sin SKU'}
                                                                        </p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4 text-right">
                                                                    <p className="text-xs font-black text-muted-foreground tabular-nums">{formatCurrency(price)}</p>
                                                                </td>
                                                                <td className="px-8 py-4 text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        <span className="text-xs font-bold text-muted-foreground">$</span>
                                                                        <input
                                                                            type="number"
                                                                            defaultValue={v.cost_price || ''}
                                                                            onBlur={(e) => {
                                                                                const val = parseFloat(e.target.value);
                                                                                if (!isNaN(val) && val.toString() !== v.cost_price) {
                                                                                    handleUpdateProductCost(v.variant_id, v.product_id, val);
                                                                                }
                                                                            }}
                                                                            className="w-24 px-3 py-1.5 bg-background border border-border rounded-lg text-sm font-black text-right outline-none focus:ring-1 focus:ring-accent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                            placeholder="0"
                                                                        />
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <p className={`text-xs font-black ${markup > 50 ? 'text-emerald-500' : markup > 20 ? 'text-orange-500' : 'text-red-500'}`}>
                                                                            {markup.toFixed(1)}%
                                                                        </p>
                                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Markup</p>
                                                                    </div>
                                                                </td>
                                                                <td className="px-8 py-4 text-right">
                                                                    <div className="flex flex-col items-end">
                                                                        <p className={`text-xs font-black ${margin > 30 ? 'text-emerald-500' : margin > 10 ? 'text-orange-500' : 'text-red-500'}`}>
                                                                            {margin.toFixed(1)}%
                                                                        </p>
                                                                        <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">Margen</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </React.Fragment>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/20 p-6 rounded-3xl flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                        <div>
                            <p className="text-sm font-black text-amber-600 uppercase tracking-tight mb-1">Nota sobre rentabilidad</p>
                            <p className="text-xs font-medium text-amber-600/70 leading-relaxed uppercase">
                                Los costos unitarios guardados aquí se utilizarán automáticamente en los reportes de rentabilidad para calcular tu utilidad neta. Asegúrate de mantenerlos actualizados ante cambios en tus proveedores.
                            </p>
                        </div>
                    </div>
                </div>
            )
            }
        </section >
    );
}
