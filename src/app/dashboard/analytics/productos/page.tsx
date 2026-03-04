"use client";

export default function ProductosAnalyticsPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Gestión de Productos</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-black uppercase tracking-widest">Deep Dive</span>
                    <p className="text-gray-400 font-bold italic">Stock, Variantes y Performance por Producto</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-gray-900">Productos Destacados</h3>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-2xl">🏆</div>
                    </div>

                    <div className="flex flex-col gap-6 items-center justify-center py-20 text-gray-300 border-2 border-dashed border-gray-50 rounded-[2.5rem]">
                        <span className="text-5xl">🏷️</span>
                        <p className="font-bold italic">No hay productos con ventas registradas aún.</p>
                    </div>
                </div>

                <div className="bg-gradient-to-b from-indigo-600 to-blue-700 rounded-[3rem] p-10 text-white shadow-2xl flex flex-col gap-8">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Resumen de Inventario</span>
                        <h4 className="text-3xl font-black">Stock Audit</h4>
                    </div>

                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase opacity-60">Total SKU</span>
                            <span className="text-4xl font-black">0</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-red-400/20 backdrop-blur-md border border-red-400/20 flex flex-col gap-1">
                            <span className="text-[10px] font-black uppercase opacity-60 text-red-100">Sin Stock</span>
                            <span className="text-4xl font-black text-red-100">0</span>
                        </div>
                    </div>

                    <p className="text-xs font-bold leading-relaxed opacity-60 italic mt-auto">
                        Asegúrate de sincronizar tu tienda para ver métricas de stock en tiempo real.
                    </p>
                </div>
            </div>
        </section>
    );
}
