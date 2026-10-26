import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  showFirstLast?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
}: PaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const showEllipsis = totalPages > 7

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1)
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
      } else {
        pages.push(1)
        pages.push("...")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="text-sm text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1">
        {showFirstLast && (
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className={cn(
              "rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors",
              "hover:bg-white/10 hover:text-white",
              currentPage === 1 && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronsLeft size={16} />
          </button>
        )}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            "rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors",
            "hover:bg-white/10 hover:text-white",
            currentPage === 1 && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <button
                key={index}
                onClick={() => onPageChange(page)}
                className={cn(
                  "min-w-[2.5rem] rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                  currentPage === page
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                )}
              >
                {page}
              </button>
            ) : (
              <span key={index} className="px-2 text-slate-500">…</span>
            )
          )}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={cn(
            "rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors",
            "hover:bg-white/10 hover:text-white",
            currentPage === totalPages && "opacity-50 cursor-not-allowed"
          )}
        >
          <ChevronRight size={16} />
        </button>

        {showFirstLast && (
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className={cn(
              "rounded-lg border border-white/10 bg-white/5 p-2 text-slate-300 transition-colors",
              "hover:bg-white/10 hover:text-white",
              currentPage === totalPages && "opacity-50 cursor-not-allowed"
            )}
          >
            <ChevronsRight size={16} />
          </button>
        )}
      </div>
    </div>
  )
}
