"use client";

import { useTheme } from "next-themes";
import Skeleton from "@/components/ui/Skeleton";

interface HeatmapChartProps {
    data: { day: number; hour: number; count: number; revenue: number }[];
    loading?: boolean;
}

export default function HeatmapChart({ data, loading }: HeatmapChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

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
        if (!item) return isDark ? 0.03 : 0.05;
        return 0.15 + (Number(item.count) / maxCount) * 0.85;
    };

    const getTooltip = (dayId: number, hour: number) => {
        const item = data.find(d => Number(d.day) === dayId && Number(d.hour) === hour);
        if (!item) return "Sin ventas registradas";
        return `${item.count} pedidos • ${new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(item.revenue)}`;
    };

    const dayLabel = (dayId: number) => days.find(d => d.id === dayId)?.label || "";

    if (loading) {
        return (
            <div className="w-full flex flex-col gap-4">
                <Skeleton className="w-full h-64 rounded-[2rem]" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 w-full overflow-x-auto pb-4 custom-scrollbar">
            <div className="min-w-[850px]">
                {/* Hours Header */}
                <div className="flex mb-4">
                    <div className="w-14 flex-shrink-0"></div>
                    <div className="flex-1 grid grid-cols-24 gap-1.5">
                        {hours.map(hour => (
                            <div key={hour} className="text-[9px] font-black text-muted-foreground/60 text-center uppercase tracking-tighter">
                                {hour.toString().padStart(2, '0')}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Grid Rows */}
                <div className="flex flex-col gap-1.5 text-sans">
                    {days.map((day) => (
                        <div key={day.id} className="flex items-center gap-4 group/row">
                            <div className="w-10 text-[10px] font-black text-muted-foreground uppercase tracking-widest group-hover/row:text-accent transition-colors">
                                {day.label}
                            </div>
                            <div className="flex-1 grid grid-cols-24 gap-1.5">
                                {hours.map((hour) => (
                                    <div key={hour} className="group relative">
                                        <div
                                            style={{ opacity: getOpacity(day.id, hour) }}
                                            className="w-full aspect-square bg-accent rounded-[4px] transition-all hover:scale-150 hover:shadow-2xl hover:shadow-accent/40 cursor-help z-10 hover:z-20 border border-transparent hover:border-white/20"
                                        ></div>

                                        <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900 text-white text-[10px] font-black py-2.5 px-4 rounded-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100 pointer-events-none z-50 shadow-2xl border border-white/10 uppercase tracking-tight">
                                            <span className="text-accent mr-1">{dayLabel(day.id)} {hour}:00</span> {getTooltip(day.id, hour)}
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-zinc-900"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-3 max-w-sm ml-14">
                <div className="flex items-center justify-between text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    <span>Baja Actividad</span>
                    <span>Pico de Ventas</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-full bg-gradient-to-r from-accent/10 via-accent/50 to-accent"></div>
                </div>
            </div>
        </div>
    );
}
