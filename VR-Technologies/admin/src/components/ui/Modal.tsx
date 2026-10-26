import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Button } from './Button'
import { cn } from '@/lib/utils'

interface ModalProps {
  title: string
  children: React.ReactNode
  onClose: () => void
  size?: 'sm' | 'md' | 'lg' | 'xl'
  footer?: {
    confirm?: { label: string; onClick: () => void; loading?: boolean; variant?: 'default' | 'destructive' }
    cancel?: { label: string; onClick: () => void }
  }
  icon?: ReactNode
  description?: string
}

const sizeMap = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

export default function Modal({
  title,
  children,
  onClose,
  size = 'md',
  footer,
  icon,
  description,
}: ModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fadeIn">
      <div
        className={cn(
          'w-full max-h-[90vh] flex flex-col bg-gradient-to-b from-slate-900/90 to-slate-950 rounded-2xl border border-white/10 shadow-2xl overflow-hidden',
          sizeMap[size],
          'animate-slideInUp'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div className="flex items-start gap-3">
            {icon && <div className="text-2xl mt-1">{icon}</div>}
            <div>
              <h2 className="text-xl font-bold text-white">{title}</h2>
              {description && (
                <p className="mt-1 text-sm text-slate-400">{description}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-white/10 bg-slate-950/50 p-6 flex items-center justify-end gap-3">
            {footer.cancel && (
              <Button
                variant="outline"
                onClick={footer.cancel.onClick}
              >
                {footer.cancel.label}
              </Button>
            )}
            {footer.confirm && (
              <Button
                variant={footer.confirm.variant || 'default'}
                onClick={footer.confirm.onClick}
                loading={footer.confirm.loading}
              >
                {footer.confirm.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
