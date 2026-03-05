"use client";

interface HeatmapChartProps {
    data: { day: number; hour: number; count: number; revenue: number }[];
    loading?: boolean;
}

export default function HeatmapChart({ data, loading }: HeatmapChartProps) {
    const days = [
        { id: 1, label: "Lun" },
        { id: 2, label: "Mar" },
        { id: 3, label: "Mie" },
        { id: 4, label: "Jue" },
        { id: 5, label: "Vie" },
        { id: 6, label: "Sab" },
        { id: 0, label: "Dom" },
    ];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Find max count for scaling color
    const maxCount = Math.max(...data.map(d => Number(d.count)), 1);

    const getOpacity = (dayId: number, hour: number) => {
        const item = data.find(d => Number(d.day) === dayId && Number(d.hour) === hour);
        if (!item) return 0.05;
        return 0.1 + (Number(item.count) / maxCount) * 0.9;
    };

    const getTooltip = (dayId: number, hour: number) => {
        const item = data.find(d => Number(d.day) === dayId && Number(d.hour) === hour);
        if (!item) return "Sin ventas";
        return `${item.count} pedidos - ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(item.revenue)}`;
    };

    const dayLabel = (dayId: number) => days.find(d => d.id === dayId)?.label || "";

    if (loading) {
        return (
            <div className="w-full h-48 bg-gray-50 animate-pulse rounded-2xl flex items-center justify-center">
                <span className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">Cargando Heatmap...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4 w-full overflow-x-auto pb-2">
            <div className="min-w-[800px]">
                {/* Hours Header */}
                <div className="flex mb-2">
                    <div className="w-12 flex-shrink-0"></div>
                    <div className="flex-1 grid grid-cols-24 gap-1">
                        {hours.map(hour => (
                            <div key={hour} className="text-[8px] font-black text-gray-400 text-center">
                                {hour}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Rows */}
                <div className="flex flex-col gap-1">
                    {days.map((day) => (
                        <div key={day.id} className="flex items-center gap-2">
                            <div className="w-10 text-[10px] font-black text-gray-500 uppercase">
                                {day.label}
                            </div>
                            <div className="flex-1 grid grid-cols-24 gap-1">
                                {hours.map((hour) => (
                                    <div key={hour} className="group relative">
                                        <div
                                            style={{ opacity: getOpacity(day.id, hour) }}
                                            className="w-full aspect-square bg-blue-600 rounded-sm transition-all hover:scale-125 hover:shadow-lg cursor-help z-10"
                                        ></div>

                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] font-bold py-2 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-xl">
                                            {dayLabel(day.id)} {hour}:00 - {getTooltip(day.id, hour)}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-gray-900"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mt-2">
                <span>Menos Actividad</span>
                <div className="flex-1 mx-4 h-1 rounded-full bg-gradient-to-r from-blue-600/10 to-blue-600"></div>
                <span>Pico de Ventas</span>
            </div>
        </div>
    );
}
