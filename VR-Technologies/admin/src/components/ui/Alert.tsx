import * as React from "react"
import { AlertCircle, CheckCircle, XCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AlertProps {
  children: React.ReactNode
  variant?: "info" | "success" | "warning" | "error"
  className?: string
  onClose?: () => void
}

const variantConfig = {
  info: { icon: Info, bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-400", iconBg: "text-blue-500" },
  success: { icon: CheckCircle, bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-400", iconBg: "text-emerald-500" },
  warning: { icon: AlertCircle, bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-400", iconBg: "text-amber-500" },
  error: { icon: XCircle, bg: "bg-red-500/10", border: "border-red-500/30", text: "text-red-400", iconBg: "text-red-500" },
}

export function Alert({ children, variant = "info", className, onClose }: AlertProps) {
  const config = variantConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn("relative flex items-start gap-3 rounded-xl border p-4", config.bg, config.border, className)}>
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconBg)} />
      <div className="flex-1 text-sm text-slate-200">{children}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
