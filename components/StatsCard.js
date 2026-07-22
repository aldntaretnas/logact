export default function StatsCard({ title, value, subtitle, icon }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 transition-shadow hover:shadow-[0_8px_24px_rgba(30,58,138,0.55)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}
