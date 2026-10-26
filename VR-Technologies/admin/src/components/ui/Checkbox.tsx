import * as React from "react"
import { cn } from "@/lib/utils"

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        className={cn(
          "peer h-5 w-5 shrink-0 rounded-lg border-2 border-white/20 bg-slate-900/50 transition-all",
          "checked:bg-emerald-500 checked:border-emerald-500",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
      <svg
        className="pointer-events-none absolute left-0.5 top-0.5 hidden h-4 w-4 text-white peer-checked:block"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  )
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
