import { GridCell } from './grid'

export enum ActionType {
  SET_CELL = 'SET_CELL',
  SET_RANGE = 'SET_RANGE',
  CLEAR_CELL = 'CLEAR_CELL',
  CLEAR_RANGE = 'CLEAR_RANGE',
  PASTE_RANGE = 'PASTE_RANGE',
  RESIZE_COLUMN = 'RESIZE_COLUMN'
}

export interface CellSnapshot {
  row: number
  col: number
  value: string | number
  formula?: string
  display?: string
}

export interface RangeSnapshot {
  startRow: number
  startCol: number
  cells: GridCell[][]
}

export interface Action {
  type: ActionType
  timestamp: number
}

export interface SetCellAction extends Action {
  type: ActionType.SET_CELL
  before: CellSnapshot
  after: CellSnapshot
}

export interface SetRangeAction extends Action {
  type: ActionType.SET_RANGE
  before: RangeSnapshot
  after: RangeSnapshot
}

export interface ClearCellAction extends Action {
  type: ActionType.CLEAR_CELL
  before: CellSnapshot
}

export interface ClearRangeAction extends Action {
  type: ActionType.CLEAR_RANGE
  before: RangeSnapshot
}

export interface PasteRangeAction extends Action {
  type: ActionType.PASTE_RANGE
  before: RangeSnapshot
  after: RangeSnapshot
}

export interface ResizeColumnAction extends Action {
  type: ActionType.RESIZE_COLUMN
  columnIndex: number
  before: number
  after: number
}

export type HistoryAction =
  | SetCellAction
  | SetRangeAction
  | ClearCellAction
  | ClearRangeAction
  | PasteRangeAction
  | ResizeColumnAction

export interface HistoryState {
  past: HistoryAction[]
  future: HistoryAction[]
  maxHistorySize: number
}
