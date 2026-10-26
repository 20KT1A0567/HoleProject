import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string
  success?: boolean
  options?: { value: string; label: string }[]
  label?: string
  helper?: string
  icon?: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, error, success, label, helper, icon, children, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-red-400">*</span>}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 group-focus-within:text-emerald-400 transition-colors">
              {icon}
            </div>
          )}
          <select
            className={cn(
              "flex h-11 w-full appearance-none rounded-xl border bg-slate-900/60 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-all duration-200",
              "focus:outline-none focus:ring-2",
              icon && "pl-10.5",
              (error || success) && "pr-10.5",
              error
                ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/20"
                : success
                  ? "border-emerald-500/50 focus:border-emerald-500 focus:ring-emerald-500/20"
                  : "border-white/15 focus:border-emerald-500/50 focus:ring-emerald-500/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          >
            {options ? options.map(opt => (
              <option key={opt.value} value={opt.value} className="bg-slate-900">
                {opt.label}
              </option>
            )) : children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 group-focus-within:text-emerald-400">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {(error || success) && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              {error ? (
                <AlertCircle size={18} className="text-red-400" />
              ) : (
                <CheckCircle2 size={18} className="text-emerald-400" />
              )}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          {error && (
            <p className="text-xs text-red-400 font-medium flex items-center gap-1">
              <AlertCircle size={14} />
              {error}
            </p>
          )}
          {helper && !error && (
            <p className="text-xs text-slate-500">{helper}</p>
          )}
        </div>
      </div>
    )
  }
)
Select.displayName = "Select"

export { Select }
