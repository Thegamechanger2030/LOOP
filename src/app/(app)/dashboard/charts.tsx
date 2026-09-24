"use client";

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { EmptyState } from "@/components/empty-state";

const SENTIMENT_COLORS: Record<string, string> = {
  POSITIVE: "#10B981", // Emerald
  NEUTRAL: "#7C3AED",  // Deep Purple
  NEGATIVE: "#EF4444", // Crimson Red
  Unclassified: "#A78BFA",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 rounded-xl border border-[#3B1F4D] text-xs shadow-glow">
        <p className="font-bold text-white mb-1">{label || payload[0].name}</p>
        <p className="text-[#EF4444] font-semibold">
          Count: <span className="text-white">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export function DashboardCharts({
  volumeSeries,
  sentimentData,
  themeData,
  channelData,
}: {
  volumeSeries: { date: string; count: number }[];
  sentimentData: { name: string; value: number }[];
  themeData: { name: string; count: number; color: string }[];
  channelData: { name: string; count: number }[];
}) {
  if (volumeSeries.length === 0) {
    return (
      <EmptyState
        title="No feedback yet"
        description="Add feedback manually, upload a CSV, or simulate a channel from the Inbox to see charts here."
      />
    );
  }

  const formattedChannels = channelData.map((c) => ({
    ...c,
    displayName: c.name.replace("_", " ").toUpperCase(),
  }));

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Volume Area Chart */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] md:col-span-2 shadow-glow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-white">Feedback Volume Trajectory</h3>
            <p className="text-xs text-[#A78BFA]">30-day cumulative feedback ingestion trajectory</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            Real-time feed
          </span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={volumeSeries}>
            <defs>
              <linearGradient id="colorPurpleRed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 31, 77, 0.4)" />
            <XAxis dataKey="date" fontSize={11} stroke="#A78BFA" tickLine={false} />
            <YAxis fontSize={11} stroke="#A78BFA" allowDecimals={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="count" stroke="#EF4444" strokeWidth={3} fillOpacity={1} fill="url(#colorPurpleRed)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Donut Chart */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] flex flex-col justify-between shadow-glow">
        <div>
          <h3 className="text-base font-extrabold text-white mb-1">Sentiment Distribution</h3>
          <p className="text-xs text-[#A78BFA] mb-4">Tone breakdown across positive, neutral, and negative</p>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={60} outerRadius={85} paddingAngle={4}>
              {sentimentData.map((entry) => (
                <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] ?? "#7C3AED"} stroke="#0D0712" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 pt-3 border-t border-[#3B1F4D] text-xs font-semibold">
          {sentimentData.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: SENTIMENT_COLORS[s.name] ?? "#7C3AED" }} />
              <span className="text-[#F8FAFC] capitalize">{s.name.toLowerCase()}</span>
              <span className="text-[#A78BFA] font-mono">({s.value})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Themes Bar Chart */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] shadow-glow">
        <h3 className="text-base font-extrabold text-white mb-1">Top Customer Themes</h3>
        <p className="text-xs text-[#A78BFA] mb-4">Most frequently tagged AI categories</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={themeData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" fontSize={11} stroke="#A78BFA" allowDecimals={false} tickLine={false} />
            <YAxis type="category" dataKey="name" fontSize={11} stroke="#A78BFA" width={120} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[0, 8, 8, 0]}>
              {themeData.map((entry, index) => (
                <Cell key={entry.name} fill={index % 2 === 0 ? "#7C3AED" : "#EF4444"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Distribution Bar Chart */}
      <div className="glass-card rounded-2xl p-6 border border-[#3B1F4D] md:col-span-2 shadow-glow">
        <h3 className="text-base font-extrabold text-white mb-1">Volume by Ingestion Channel</h3>
        <p className="text-xs text-[#A78BFA] mb-4">Support tickets, App Store, NPS, Sales calls, and Community</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={formattedChannels}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59, 31, 77, 0.4)" />
            <XAxis dataKey="displayName" fontSize={11} stroke="#A78BFA" tickLine={false} />
            <YAxis fontSize={11} stroke="#A78BFA" allowDecimals={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#7C3AED" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
