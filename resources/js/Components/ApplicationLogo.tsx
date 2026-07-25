export default function ApplicationLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon Badge */}
      <div className="flex items-center justify-center p-2 rounded-xl transition-colors bg-emerald-600 text-white shadow-md shadow-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:shadow-none">
        <svg 
          className={className} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          {/* Dompet & Grafik M */}
          <path d="M3 17V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <path d="M7 14l3-3 2 2 5-5" />
          <path d="M17 8h.01" />
        </svg>
      </div>

      {/* Brand Text */}
      <div className="flex flex-col">
        <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase mt-0.5">
          Finance Tracker
        </span>
      </div>
    </div>
  );
}
