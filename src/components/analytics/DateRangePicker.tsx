"use client";

import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronDown, Check } from "lucide-react";
import { format, subDays, startOfWeek, startOfMonth, startOfDay, endOfDay } from "date-fns";
import { es } from "date-fns/locale";

interface DateRangePickerProps {
    onRangeChange: (from: string, to: string) => void;
}

export default function DateRangePicker({ onRangeChange }: DateRangePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [label, setLabel] = useState("Este Mes");
    const [isCustom, setIsCustom] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
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

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

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
        const from = startOfMonth(now);
        const to = endOfDay(now);
        onRangeChange(from.toISOString(), to.toISOString());
    }, [onRangeChange]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 px-5 py-3.5 bg-card border border-border rounded-2xl font-black text-foreground shadow-sm hover:border-accent/40 transition-all text-[11px] uppercase tracking-widest active:scale-95 group"
            >
                <Calendar className="w-4 h-4 text-accent group-hover:scale-110 transition-transform" />
                <span>{label}</span>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-[120%] right-0 w-72 bg-card rounded-[2rem] shadow-2xl border border-border p-3 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="grid gap-1 mb-2">
                        {ranges.map((range) => (
                            <button
                                key={range.id}
                                onClick={() => handleSelect(range)}
                                className={`w-full text-left px-5 py-3 rounded-xl transition-all font-bold text-xs flex items-center justify-between ${label === range.name && !isCustom ? 'bg-accent/10 text-accent' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                                    }`}
                            >
                                {range.name}
                                {label === range.name && !isCustom && <Check className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>

                    {isCustom && (
                        <div className="p-4 mt-2 bg-muted/50 rounded-2xl border border-border/50 space-y-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Desde</label>
                                    <input
                                        type="date"
                                        value={customDates.from}
                                        onChange={(e) => setCustomDates({ ...customDates, from: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest ml-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={customDates.to}
                                        onChange={(e) => setCustomDates({ ...customDates, to: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-xs font-bold text-foreground focus:outline-none focus:border-accent/50 focus:ring-4 focus:ring-accent/5 transition-all"
                                    />
                                </div>
                            </div>
                            <button
                                onClick={handleApplyCustom}
                                className="w-full py-3.5 bg-accent text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-accent/20 hover:bg-accent/90 hover:-translate-y-0.5 transition-all active:scale-95"
                            >
                                Aplicar Período
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
