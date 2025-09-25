import { CellCoordinate, CellRange } from './grid'

export interface SelectionState {
  activeCell: CellCoordinate | null
  anchor: CellCoordinate | null
  focus: CellCoordinate | null
  selectedRanges: CellRange[]
  isSelecting: boolean
}

export interface SelectionBounds {
  minRow: number
  maxRow: number
  minCol: number
  maxCol: number
}

export enum SelectionMode {
  SINGLE = 'single',
  RANGE = 'range',
  MULTI_RANGE = 'multi_range'
}
