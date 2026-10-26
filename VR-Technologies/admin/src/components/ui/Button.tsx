import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md hover:from-emerald-600 hover:to-emerald-700 hover:shadow-lg hover:shadow-emerald-500/30 active:scale-95 relative overflow-hidden",
        destructive:
          "bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:shadow-red-500/30 active:scale-95",
        outline:
          "border border-emerald-500/30 bg-emerald-500/5 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/10 hover:border-emerald-500/50 active:scale-95",
        secondary:
          "bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 active:scale-95 border border-white/10",
        ghost:
          "hover:bg-white/10 text-white/90 hover:text-white active:scale-95",
        link: "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
        premium:
          "bg-gradient-to-br from-purple-500 via-emerald-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:shadow-emerald-500/40 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3 text-xs",
        lg: "h-11 px-6 text-base",
        xl: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
