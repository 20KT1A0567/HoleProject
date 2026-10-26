import * as React from "react"
import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string
  success?: boolean
  label?: string
  helper?: string
  maxLength?: number
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, success, label, helper, maxLength, value, onChange, ...props }, ref) => {
    const [charCount, setCharCount] = React.useState(0)

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length)
      onChange?.(e)
    }

    return (
      <div className="space-y-1.5">
        {label && (
          <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            {label}
            {props.required && <span className="text-red-400">*</span>}
          </label>
        )}
        <div className="relative group">
          <textarea
            value={value}
            onChange={handleChange}
            maxLength={maxLength}
            className={cn(
              "flex min-h-[120px] w-full rounded-xl border bg-slate-900/60 px-3.5 py-2.5 text-sm text-white backdrop-blur-sm transition-all duration-200 resize-none",
              "placeholder:text-slate-500",
              "focus:outline-none focus:ring-2",
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
          {(error || success) && (
            <div className="absolute right-3 top-3">
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
Textarea.displayName = "Textarea"

export { Textarea }
