export interface GridCell {
  value: string | number
  formula?: string
  display?: string
  error?: string
}

export interface GridModel {
  cells: GridCell[][]
  rowCount: number
  columnCount: number
}

export interface CellCoordinate {
  row: number
  col: number
}

export interface CellRange {
  start: CellCoordinate
  end: CellCoordinate
}

export interface GridDimensions {
  minRows: number
  minColumns: number
  maxRows: number
  maxColumns: number
}

export const DEFAULT_DIMENSIONS: GridDimensions = {
  minRows: 20,
  minColumns: 20,
  maxRows: 10000,
  maxColumns: 1000
}
