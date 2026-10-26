import * as React from "react"
import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: "default" | "emerald" | "blue" | "purple" | "orange"
  className?: string
}

const variantStyles = {
  default: {
    iconBg: "bg-emerald-500/20 text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  emerald: {
    iconBg: "bg-emerald-500/20 text-emerald-400",
    gradient: "from-emerald-500/10 to-transparent",
  },
  blue: {
    iconBg: "bg-blue-500/20 text-blue-400",
    gradient: "from-blue-500/10 to-transparent",
  },
  purple: {
    iconBg: "bg-purple-500/20 text-purple-400",
    gradient: "from-purple-500/10 to-transparent",
  },
  orange: {
    iconBg: "bg-orange-500/20 text-orange-400",
    gradient: "from-orange-500/10 to-transparent",
  },
}

export function StatCard({ title, value, icon: Icon, trend, variant = "default", className }: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/80 to-slate-950 p-6",
        className
      )}
    >
      <div className={cn("absolute -right-4 -top-4 h-32 w-32 rounded-full blur-3xl opacity-30", styles.gradient)} />
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-wider text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <div className="flex items-center gap-1 text-sm">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-400" />
              )}
              <span className={trend.isPositive ? "text-emerald-400" : "text-red-400"}>
                {trend.value}%
              </span>
              <span className="text-slate-500">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn("rounded-xl p-3", styles.iconBg)}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}
