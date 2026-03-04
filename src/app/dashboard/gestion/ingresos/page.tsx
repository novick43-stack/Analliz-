"use client";

export default function IngresosPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Ingresos</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-black uppercase tracking-widest">Finanzas</span>
                    <p className="text-gray-400 font-bold italic">Análisis detallado de entradas y facturación</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-8">
                    <div className="flex justify-between items-center">
                        <h3 className="text-2xl font-black text-gray-900">Resumen de Ingresos</h3>
                        <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center text-2xl">💰</div>
                    </div>

                    <div className="space-y-6">
                        <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ventas Netas</span>
                            <span className="text-4xl font-black text-gray-900">$0.00</span>
                        </div>
                        <div className="p-8 rounded-[2rem] bg-gray-50 border border-gray-100 flex flex-col gap-2">
                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ticket Promedio</span>
                            <span className="text-4xl font-black text-blue-600">$0.00</span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[3rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center gap-8 border-4 border-green-600/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-green-600/5 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-xl flex items-center justify-center text-5xl">📊</div>
                    <div className="relative z-10">
                        <h4 className="text-2xl font-black text-white mb-2">Tendencia de Ingresos</h4>
                        <p className="text-green-300 font-bold italic text-sm">
                            "Próximamente: Gráficas interactivas de facturación diaria y mensual."
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
