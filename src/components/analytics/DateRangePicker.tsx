"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface DateRangePickerProps {
    onRangeChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [label, setLabel] = useState("Esta Semana");
    const [isCustom, setIsCustom] = useState(false);
    const [customDates, setCustomDates] = useState({
        from: format(subDays(new Date(), 30), "yyyy-MM-dd"),
        to: format(new Date(), "yyyy-MM-dd")
    });

    const ranges = [
        { name: "Hoy", id: "today" },
        { name: "Esta Semana", id: "week" },
        { name: "Este Mes", id: "month" },
        { name: "Personalizado", id: "custom" },
    ];

    const handleSelect = (range: { name: string, id: string }) => {
        const now = new Date();
        let from: Date;
        let to: Date = endOfDay(now);

        if (range.id === "custom") {
            setIsCustom(true);
            return;
        }

        setIsCustom(false);
        switch (range.id) {
            case "today":
                from = startOfDay(now);
                break;
            case "week":
                from = startOfWeek(now, { weekStartsOn: 1 });
                break;
            case "month":
                from = startOfMonth(now);
                break;
            default:
                from = startOfMonth(now);
        }

        setLabel(range.name);
        setIsOpen(false);
        onRangeChange(from.toISOString(), to.toISOString());
    };

    const handleApplyCustom = () => {
        const from = startOfDay(new Date(customDates.from));
        const to = endOfDay(new Date(customDates.to));

        setLabel(`${format(from, "dd/MM")} - ${format(to, "dd/MM")}`);
        setIsOpen(false);
        onRangeChange(from.toISOString(), to.toISOString());
    };

    useEffect(() => {
        const now = new Date();
        const from = startOfWeek(now, { weekStartsOn: 1 });
        const to = endOfDay(now);
        onRangeChange(from.toISOString(), to.toISOString());
    }, [onRangeChange]);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-6 py-3 bg-white border-2 border-gray-100 rounded-2xl font-black text-gray-900 shadow-sm hover:border-blue-200 transition-all text-sm uppercase tracking-widest"
            >
                <Calendar className="w-5 h-5 text-blue-600" />
                <span>{label}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-3 right-0 w-72 bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-3">
                        <div className="grid gap-1 mb-2">
                            {ranges.map((range) => (
                                <button
                                    key={range.id}
                                    onClick={() => handleSelect(range)}
                                    className={`w-full text-left px-5 py-3 rounded-xl transition-colors font-bold text-sm flex items-center justify-between ${label === range.name && !isCustom ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    {range.name}
                                    {label === range.name && !isCustom && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>

                        {isCustom && (
                            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Desde</label>
                                        <input
                                            type="date"
                                            value={customDates.from}
                                            onChange={(e) => setCustomDates({ ...customDates, from: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Hasta</label>
                                        <input
                                            type="date"
                                            value={customDates.to}
                                            onChange={(e) => setCustomDates({ ...customDates, to: e.target.value })}
                                            className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-700 focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    onClick={handleApplyCustom}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
                                >
                                    Aplicar Filtro
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
