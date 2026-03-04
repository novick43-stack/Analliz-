"use client";

export default function CostosPage() {
    return (
        <section className="flex flex-col gap-10 pb-20">
            <div className="flex flex-col gap-4">
                <h2 className="text-5xl font-black text-gray-900 tracking-tight">Costos</h2>
                <div className="flex items-center gap-3">
                    <span className="px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest">Finanzas</span>
                    <p className="text-gray-400 font-bold italic">Gestión de costos de mercadería y gastos fijos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="lg:col-span-2 bg-white rounded-[3rem] p-12 border border-gray-100 shadow-xl flex flex-col gap-10">
                    <div className="flex justify-between items-center">
                        <h3 className="text-3xl font-black text-gray-900">Asignar Costos por Producto</h3>
                        <button className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-sm hover:scale-105 transition-all">
                            Carga Masiva
                        </button>
                    </div>

                    <div className="flex flex-col items-center justify-center py-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-[2.5rem] gap-4">
                        <div className="text-6xl">🛠️</div>
                        <div className="text-center max-w-sm">
                            <p className="font-black text-gray-900 text-lg mb-1">Empieza a cargar tus costos</p>
                            <p className="text-gray-500 font-medium text-sm">Necesitamos saber cuánto te cuesta cada producto para calcular tu rentabilidad.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-10 border border-red-50 shadow-xl flex flex-col gap-8">
                    <h4 className="text-xl font-black text-gray-900">Estructura de Gastos</h4>
                    <div className="space-y-4">
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center opacity-40">
                            <span className="font-bold text-gray-400">Fixed Costs</span>
                            <span className="font-black text-gray-900">$0.00</span>
                        </div>
                        <div className="p-6 rounded-2xl bg-gray-50 border border-gray-100 flex justify-between items-center opacity-40">
                            <span className="font-bold text-gray-400">Variable Costs</span>
                            <span className="font-black text-gray-900">$0.00</span>
                        </div>
                    </div>

                    <div className="mt-auto p-6 rounded-[2rem] bg-red-50 text-red-600 flex flex-col gap-2">
                        <h5 className="font-black">Atención</h5>
                        <p className="text-xs font-bold leading-relaxed">
                            No has registrado costos para el 100% de tus productos activos.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
