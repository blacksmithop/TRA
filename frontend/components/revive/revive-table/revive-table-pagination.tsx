import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface Props {
  currentPage: number
  totalPages: number
  startIndex: number
  endIndex: number
  totalFiltered: number
  isLoadingMore: boolean
  onPageChange: (page: number) => void
}

export function ReviveTablePagination({
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  totalFiltered,
  isLoadingMore,
  onPageChange,
}: Props) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(endIndex, totalFiltered)} of {totalFiltered} revives
        {isLoadingMore && (
          <span className="ml-2 inline-flex items-center gap-1">
            <Spinner className="h-3 w-3" />
            <span>Loading more...</span>
          </span>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) pageNum = i + 1
              else if (currentPage <= 3) pageNum = i + 1
              else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i
              else pageNum = currentPage - 2 + i

              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(pageNum)}
                  className="w-10"
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}