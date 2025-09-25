import { CellRange, GridCell } from '../types/grid'
import { SelectionBounds } from '../types/selection'

export function getRangeBounds(ranges: CellRange[]): SelectionBounds {
  if (ranges.length === 0) {
    return { minRow: 0, maxRow: 0, minCol: 0, maxCol: 0 }
  }

  let minRow = Infinity
  let maxRow = -Infinity
  let minCol = Infinity
  let maxCol = -Infinity

  for (const range of ranges) {
    minRow = Math.min(minRow, range.start.row, range.end.row)
    maxRow = Math.max(maxRow, range.start.row, range.end.row)
    minCol = Math.min(minCol, range.start.col, range.end.col)
    maxCol = Math.max(maxCol, range.start.col, range.end.col)
  }

  return { minRow, maxRow, minCol, maxCol }
}

export function getRangeSize(range: CellRange): { rows: number; cols: number } {
  const rows = Math.abs(range.end.row - range.start.row) + 1
  const cols = Math.abs(range.end.col - range.start.col) + 1
  return { rows, cols }
}

export function extractRangeData(grid: GridCell[][], range: CellRange): GridCell[][] {
  const normalized = {
    start: {
      row: Math.min(range.start.row, range.end.row),
      col: Math.min(range.start.col, range.end.col)
    },
    end: {
      row: Math.max(range.start.row, range.end.row),
      col: Math.max(range.start.col, range.end.col)
    }
  }

  const data: GridCell[][] = []

  for (let row = normalized.start.row; row <= normalized.end.row; row++) {
    const rowData: GridCell[] = []
    for (let col = normalized.start.col; col <= normalized.end.col; col++) {
      rowData.push(grid[row]?.[col] || { value: '', display: '' })
    }
    data.push(rowData)
  }

  return data
}