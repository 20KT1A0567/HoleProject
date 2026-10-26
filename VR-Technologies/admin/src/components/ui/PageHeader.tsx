import type { ReactNode } from 'react'
import { Button } from './Button'

interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  secondary?: {
    label: string
    onClick: () => void
    icon?: React.ReactNode
  }
  breadcrumb?: { label: string; href?: string }[]
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  action,
  secondary,
  breadcrumb,
}: PageHeaderProps) {
  return (
    <div className="space-y-4 mb-8 animate-fadeIn">
      {breadcrumb && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          {breadcrumb.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              {item.href ? (
                <a href={item.href} className="hover:text-emerald-400 transition-colors">
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
              {idx < breadcrumb.length - 1 && <span>/</span>}
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {icon && <div className="text-3xl">{icon}</div>}
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm font-medium text-slate-400">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {secondary && (
            <Button
              variant="outline"
              onClick={secondary.onClick}
              icon={secondary.icon}
            >
              {secondary.label}
            </Button>
          )}
          {action && (
            <Button
              onClick={action.onClick}
              icon={action.icon}
            >
              {action.label}
            </Button>
          )}
        </div>
      </div>
      <div className="h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />
    </div>
  )
}
