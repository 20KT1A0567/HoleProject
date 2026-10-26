import * as React from "react"
import { cn } from "@/lib/utils"

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <button
      type="button"
      role="switch"
      aria-checked={props.checked}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:ring-offset-2",
        props.checked ? "bg-emerald-500" : "bg-white/20",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={() => {
        if (!props.disabled && props.onChange) {
          const event = {
            target: { checked: !props.checked },
          } as unknown as React.ChangeEvent<HTMLInputElement>
          props.onChange(event)
        }
      }}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform duration-200",
          props.checked ? "translate-x-5" : "translate-x-0"
        )}
      />
      <input
        type="checkbox"
        className="sr-only"
        ref={ref}
        {...props}
      />
    </button>
  )
)
Switch.displayName = "Switch"

export { Switch }
