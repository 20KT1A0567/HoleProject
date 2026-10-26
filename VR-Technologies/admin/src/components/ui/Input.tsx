import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  error?: string
  success?: boolean
  label?: string
  helper?: string
  maxLength?: number
  showPasswordToggle?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, success, label, helper, maxLength, showPasswordToggle, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    const inputType = showPasswordToggle && type === 'password' ? (showPassword ? 'text' : 'password') : type

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
          <input
            type={inputType}
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            className={cn(
              "flex h-11 w-full rounded-xl border bg-slate-900/60 px-3 py-2.5 text-sm text-white backdrop-blur-sm transition-all duration-200",
              "placeholder:text-slate-500",
              "focus:outline-none focus:ring-2",
              icon && "pl-10.5",
              showPasswordToggle && type === 'password' && "pr-10.5",
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
          />
          {showPasswordToggle && type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
          {(error || success) && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
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
          {maxLength && (
            <p className={cn(
              "text-xs font-medium",
              charCount > maxLength * 0.9 ? "text-amber-400" : "text-slate-500"
            )}>
              {charCount}/{maxLength}
            </p>
          )}
        </div>
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
