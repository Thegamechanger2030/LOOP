export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: any;
  trend?: string;
}) {
  return (
    <div className="glass-card glass-card-hover rounded-2xl p-5 border border-[#3B1F4D] relative overflow-hidden group">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#A78BFA]">{label}</p>
        {Icon && (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#7C3AED]/20 to-[#EF4444]/20 border border-[#3B1F4D] flex items-center justify-center text-[#A855F7] group-hover:scale-110 group-hover:text-[#EF4444] transition-all">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between">
        <p className="text-3xl font-black text-white tracking-tight">{value}</p>
        {trend && (
          <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
            {trend}
          </span>
        )}
      </div>
      {hint && <p className="text-xs text-[#A78BFA] mt-1.5 font-medium">{hint}</p>}
    </div>
  );
}
