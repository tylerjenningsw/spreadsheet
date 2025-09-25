import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import {
  HistoryAction,
  HistoryState,
  ActionType,
  SetCellAction,
  CellSnapshot,
  RangeSnapshot,
  SetRangeAction,
  PasteRangeAction,
  ResizeColumnAction
} from '../types/history'
import { GridCell } from '../types/grid'

export function useHistory() {
  const MAX_HISTORY_SIZE = 100

  const history: Ref<HistoryState> = ref({
    past: [],
    future: [],
    maxHistorySize: MAX_HISTORY_SIZE
  })

  const canUndo = computed(() => history.value.past.length > 0)
  const canRedo = computed(() => history.value.future.length > 0)

  function pushAction(action: HistoryAction) {
    // Add to past
    history.value.past.push(action)

    // Clear future when new action is performed
    history.value.future = []

    // Limit history size
    if (history.value.past.length > MAX_HISTORY_SIZE) {
      history.value.past.shift()
    }
  }

  function createSetCellAction(before: CellSnapshot, after: CellSnapshot): SetCellAction {
    return {
      type: ActionType.SET_CELL,
      timestamp: Date.now(),
      before,
      after
    }
  }

  function createSetRangeAction(before: RangeSnapshot, after: RangeSnapshot): SetRangeAction {
    return {
      type: ActionType.SET_RANGE,
      timestamp: Date.now(),
      before,
      after
    }
  }

  function createPasteRangeAction(before: RangeSnapshot, after: RangeSnapshot): PasteRangeAction {
    return {
      type: ActionType.PASTE_RANGE,
      timestamp: Date.now(),
      before,
      after
    }
  }

  function createResizeColumnAction(
    columnIndex: number,
    before: number,
    after: number
  ): ResizeColumnAction {
    return {
      type: ActionType.RESIZE_COLUMN,
      timestamp: Date.now(),
      columnIndex,
      before,
      after
    }
  }

  function createCellSnapshot(row: number, col: number, cell: GridCell | null): CellSnapshot {
    if (!cell) {
      return {
        row,
        col,
        value: '',
        display: ''
      }
    }
    return {
      row,
      col,
      value: cell.value,
      formula: cell.formula,
      display: cell.display
    }
  }

  function createRangeSnapshot(
    startRow: number,
    startCol: number,
    cells: GridCell[][]
  ): RangeSnapshot {
    // Deep copy the cells
    const cellsCopy = cells.map(row =>
      row.map(cell => ({
        value: cell.value,
        formula: cell.formula,
        display: cell.display,
        error: cell.error
      }))
    )

    return {
      startRow,
      startCol,
      cells: cellsCopy
    }
  }

  function undo(applyAction: (action: HistoryAction, isUndo: boolean) => void): boolean {
    if (!canUndo.value) return false

    const action = history.value.past.pop()
    if (!action) return false

    history.value.future.unshift(action)
    applyAction(action, true)

    return true
  }

  function redo(applyAction: (action: HistoryAction, isUndo: boolean) => void): boolean {
    if (!canRedo.value) return false

    const action = history.value.future.shift()
    if (!action) return false

    history.value.past.push(action)
    applyAction(action, false)

    return true
  }

  function clear() {
    history.value.past = []
    history.value.future = []
  }

  function recordCellChange(
    row: number,
    col: number,
    beforeCell: GridCell | null,
    afterCell: GridCell | null
  ) {
    const before = createCellSnapshot(row, col, beforeCell)
    const after = createCellSnapshot(row, col, afterCell)

    // Don't record if nothing changed
    if (before.value === after.value && before.formula === after.formula) {
      return
    }

    const action = createSetCellAction(before, after)
    pushAction(action)
  }

  function recordRangeChange(
    startRow: number,
    startCol: number,
    beforeCells: GridCell[][],
    afterCells: GridCell[][]
  ) {
    const before = createRangeSnapshot(startRow, startCol, beforeCells)
    const after = createRangeSnapshot(startRow, startCol, afterCells)
    const action = createSetRangeAction(before, after)
    pushAction(action)
  }

  function recordPaste(
    startRow: number,
    startCol: number,
    beforeCells: GridCell[][],
    afterCells: GridCell[][]
  ) {
    const before = createRangeSnapshot(startRow, startCol, beforeCells)
    const after = createRangeSnapshot(startRow, startCol, afterCells)
    const action = createPasteRangeAction(before, after)
    pushAction(action)
  }

  function recordColumnResize(columnIndex: number, beforeWidth: number, afterWidth: number) {
    const action = createResizeColumnAction(columnIndex, beforeWidth, afterWidth)
    pushAction(action)
  }

  return {
    history,
    canUndo,
    canRedo,
    undo,
    redo,
    clear,
    recordCellChange,
    recordRangeChange,
    recordPaste,
    recordColumnResize,
    createCellSnapshot,
    createRangeSnapshot
  }
}
