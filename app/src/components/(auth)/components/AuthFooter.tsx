import { Globe, ChevronDown } from 'lucide-react'

export function AuthFooter() {
  return (
    <footer className="flex w-full items-center justify-between pt-4 text-[11px] text-slate-400 font-medium">
      <span>&copy; 2026 Zayn</span>
      <div className="flex items-center gap-1.5 cursor-pointer text-slate-500 hover:text-slate-700 transition-colors">
        <Globe className="h-3.5 w-3.5 text-slate-400" />
        <span className="text-[11px] font-medium">ENG</span>
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </div>
    </footer>
  )
}
