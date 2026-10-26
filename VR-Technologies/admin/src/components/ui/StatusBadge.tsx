import { Badge } from './Badge'

interface StatusBadgeProps {
  status: string
  className?: string
}

const statusConfig: Record<string, 'success' | 'warning' | 'destructive' | 'default' | 'info' | 'secondary'> = {
  DELIVERED: 'success',
  COMPLETED: 'success',
  PROCESSING: 'info',
  SHIPPED: 'warning',
  CANCELLED: 'destructive',
  Active: 'success',
  Inactive: 'secondary',
  Approved: 'success',
  Pending: 'warning',
  Expired: 'destructive',
  SUPER_ADMIN: 'default',
  STORE_MANAGER: 'info',
  SALES_STAFF: 'default',
  SUPPORT: 'warning',
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
  const variant = statusConfig[status] || 'secondary'

  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  )
}
