import * as React from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "./Checkbox"

export interface Column<T> {
  key: string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  width?: string
  filterable?: boolean
}

export interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  striped?: boolean
  hoverable?: boolean
  emptyMessage?: string
  loading?: boolean
  selectable?: boolean
  onRowsSelected?: (rows: T[]) => void
  searchable?: boolean
  compact?: boolean
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  striped = true,
  hoverable = true,
  emptyMessage = "No data available",
  loading = false,
  selectable = false,
  onRowsSelected,
  searchable = true,
  compact = false,
}: DataTableProps<T>) {
  const [sortConfig, setSortConfig] = React.useState<{ key: string; direction: 'asc' | 'desc' } | null>(null)
  const [selectedRows, setSelectedRows] = React.useState<Set<number>>(new Set())
  const [searchQuery, setSearchQuery] = React.useState('')

  // Filter data based on search query
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data
    const query = searchQuery.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(value =>
        String(value).toLowerCase().includes(query)
      )
    )
  }, [data, searchQuery])

  // Sort filtered data
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (aValue === bValue) return 0
      if (aValue === null || aValue === undefined) return 1
      if (bValue === null || bValue === undefined) return -1

      const comparison = aValue < bValue ? -1 : 1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [filteredData, sortConfig])

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (!prev || prev.key !== key) {
        return { key, direction: 'asc' }
      }
      if (prev.direction === 'asc') {
        return { key, direction: 'desc' }
      }
      return null
    })
  }

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="ml-1 h-4 w-4 opacity-30" />
    }
    return sortConfig.direction === 'asc'
      ? <ChevronUp className="ml-1 h-4 w-4 text-emerald-400" />
      : <ChevronDown className="ml-1 h-4 w-4 text-emerald-400" />
  }

  const handleRowSelect = (index: number) => {
    const newSelected = new Set(selectedRows)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedRows(newSelected)
    if (onRowsSelected) {
      onRowsSelected(sortedData.filter((_, idx) => newSelected.has(idx)))
    }
  }

  const handleSelectAll = () => {
    if (selectedRows.size === sortedData.length) {
      setSelectedRows(new Set())
      if (onRowsSelected) onRowsSelected([])
    } else {
      const newSelected = new Set(sortedData.map((_, idx) => idx))
      setSelectedRows(newSelected)
      if (onRowsSelected) onRowsSelected(sortedData)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="w-full space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={cn(
              "w-full rounded-lg border border-white/15 bg-slate-900/50 pl-9 pr-4 py-2 text-sm text-white placeholder:text-slate-500",
              "focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            )}
          />
        </div>
      )}

      {/* Table */}
      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-slate-900/50 to-slate-950/80">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900/80">
                {selectable && (
                  <th className="px-4 py-3">
                    <Checkbox
                      checked={selectedRows.size === sortedData.length && sortedData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-300",
                      col.sortable && "cursor-pointer hover:text-emerald-400 select-none transition-colors",
                      col.width && `w-[${col.width}]`,
                      compact && "py-2"
                    )}
                    style={col.width ? { width: col.width } : undefined}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.header}
                      {col.sortable && getSortIcon(col.key)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-12 text-center text-sm text-slate-400">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                sortedData.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "transition-all",
                      striped && index % 2 === 0 && "bg-slate-900/30",
                      hoverable && "hover:bg-emerald-500/10 hover:border-emerald-500/20",
                      selectedRows.has(index) && "bg-emerald-500/10 border-emerald-500/30",
                      onRowClick && "cursor-pointer"
                    )}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <Checkbox
                          checked={selectedRows.has(index)}
                          onChange={() => handleRowSelect(index)}
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          "px-4 py-3 text-sm text-slate-200",
                          compact && "py-2"
                        )}
                        onClick={() => onRowClick?.(row)}
                      >
                        {col.cell ? col.cell(row) : String(row[col.key] ?? "-")}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Info */}
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between text-xs text-slate-400 px-2">
          <span>
            Showing {sortedData.length} {sortedData.length === 1 ? 'row' : 'rows'}
            {searchQuery && ` (filtered from ${data.length})`}
            {selectable && selectedRows.size > 0 && ` • ${selectedRows.size} selected`}
          </span>
        </div>
      )}
    </div>
  )
}
