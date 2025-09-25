import { CellCoordinate, CellRange, GridCell } from '../types/grid'

export function createEmptyCell(): GridCell {
  return {
    value: '',
    display: ''
  }
}

export function getCellId(row: number, col: number): string {
  return `${row}-${col}`
}

export function parseCellId(cellId: string): CellCoordinate {
  const [row, col] = cellId.split('-').map(Number)
  return { row, col }
}

export function isCellInRange(cell: CellCoordinate, range: CellRange): boolean {
  const minRow = Math.min(range.start.row, range.end.row)
  const maxRow = Math.max(range.start.row, range.end.row)
  const minCol = Math.min(range.start.col, range.end.col)
  const maxCol = Math.max(range.start.col, range.end.col)

  return (
    cell.row >= minRow &&
    cell.row <= maxRow &&
    cell.col >= minCol &&
    cell.col <= maxCol
  )
}

export function normalizeRange(range: CellRange): CellRange {
  return {
    start: {
      row: Math.min(range.start.row, range.end.row),
      col: Math.min(range.start.col, range.end.col)
    },
    end: {
      row: Math.max(range.start.row, range.end.row),
      col: Math.max(range.start.col, range.end.col)
    }
  }
}