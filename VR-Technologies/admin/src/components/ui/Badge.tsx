import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 gap-1.5",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105",
        secondary:
          "border-transparent bg-slate-700 text-slate-100 hover:bg-slate-600",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30",
        outline: "border-white/30 text-white bg-white/5 hover:bg-white/10 hover:border-white/50",
        success:
          "border-emerald-500/50 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30",
        warning:
          "border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30",
        info:
          "border-blue-500/50 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
        premium:
          "border-purple-500/50 bg-gradient-to-r from-purple-500/20 to-emerald-500/20 text-purple-300 hover:shadow-lg",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-1.5 py-0.5 text-[10px]",
        lg: "px-3 py-1 text-sm",
      },
      animated: {
        true: "animate-pulse",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animated: false,
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
  VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode
}

function Badge({ className, variant, size, animated, icon, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size, animated }), className)} {...props}>
      {icon}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
