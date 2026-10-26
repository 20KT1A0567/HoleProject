import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressProps {
  value: number
  max?: number
  variant?: "default" | "emerald" | "blue" | "purple"
  showLabel?: boolean
  className?: string
}

const variantStyles = {
  default: "bg-emerald-500",
  emerald: "bg-emerald-500",
  blue: "bg-blue-500",
  purple: "bg-purple-500",
}

export function Progress({ value, max = 100, variant = "default", showLabel = false, className }: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)

  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between gap-2">
        {showLabel && (
          <span className="text-sm font-medium text-slate-300">{Math.round(percentage)}%</span>
        )}
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn("h-full rounded-full transition-all duration-300", variantStyles[variant])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
