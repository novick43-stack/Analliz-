"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import { useTheme } from "next-themes";

interface FunnelChartProps {
    data: { name: string; value: number }[];
}

export default function FunnelChart({ data }: FunnelChartProps) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    // Mailkit inspired palette
    const COLORS = ['#5841D8', '#6D5AE0', '#8273E8', '#978BF0', '#ACA4F8'];

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{ top: 20, right: 80, left: 40, bottom: 20 }}
                >
                    <XAxis type="number" hide />
                    <YAxis
                        dataKey="name"
                        type="category"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                            fill: isDark ? '#94a3b8' : '#64748b',
                            fontSize: 10,
                            fontWeight: 800,
                            textAnchor: 'end'
                        }}
                        width={120}
                        style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}
                    />
                    <Tooltip
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                        contentStyle={{
                            borderRadius: '24px',
                            border: `1px solid ${isDark ? '#262626' : '#e5e7eb'}`,
                            backgroundColor: isDark ? '#111111' : '#ffffff',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.2)'
                        }}
                        itemStyle={{ fontWeight: 800, fontSize: 12, color: isDark ? '#f8fafc' : '#1e293b' }}
                    />
                    <Bar dataKey="value" radius={[0, 20, 20, 0]} barSize={32}>
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        <LabelList
                            dataKey="value"
                            position="right"
                            style={{
                                fill: isDark ? '#f8fafc' : '#1e293b',
                                fontWeight: 900,
                                fontSize: 13,
                                letterSpacing: '-0.02em'
                            }}
                        />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
