"use client";

export default function VentasAnalyticsPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Análisis de Ventas</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-blue-100 text-blue-700 text-xs font-black uppercase tracking-widest">Deep Dive</span>
                    <p className="text-gray-400 font-bold italic">En detalle: Facturación, Órdenes e Ingresos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-6">
                    <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-4xl">💰</div>
                    <div>
                        <h3 className="text-3xl font-black text-gray-900 underline decoration-blue-200 underline-offset-8 mb-4">Métricas Principales</h3>
                        <div className="space-y-6 mt-8">
                            <div className="flex justify-between items-end border-b-2 border-gray-50 pb-4">
                                <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Total Facturado</span>
                                <span className="text-3xl font-black text-blue-600">$0.00</span>
                            </div>
                            <div className="flex justify-between items-end border-b-2 border-gray-50 pb-4">
                                <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Pedidos Totales</span>
                                <span className="text-3xl font-black text-gray-800">0</span>
                            </div>
                            <div className="flex justify-between items-end border-b-2 border-gray-50 pb-4">
                                <span className="text-gray-400 font-black text-xs uppercase tracking-widest">Ticket Promedio</span>
                                <span className="text-3xl font-black text-indigo-600">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[3.5rem] p-12 shadow-2xl relative overflow-hidden flex flex-col items-center justify-center text-center gap-8 border-4 border-blue-600/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full -translate-y-24 translate-x-24"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full translate-y-24 -translate-x-24"></div>

                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-5xl animate-pulse">
                        📊
                    </div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black text-white mb-2 tracking-tight">Insight de Ventas</h4>
                        <p className="text-blue-300 font-bold italic text-sm">
                            "Estamos procesando tus datos de Tienda Nube para generar gráficas de tendencia avanzadas."
                        </p>
                    </div>
                    <button className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-black hover:scale-105 transition-all text-sm uppercase tracking-widest">
                        Refrescar Datos
                    </button>
                </div>
            </div>
        </section>
    );
}
