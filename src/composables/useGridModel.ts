import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { GridCell, GridModel, CellCoordinate, DEFAULT_DIMENSIONS } from '../types/grid'
import { createEmptyCell } from '../utils/cellHelpers'

export function useGridModel() {
  const cells: Ref<GridCell[][]> = ref([])
  const rowCount = ref(DEFAULT_DIMENSIONS.minRows)
  const columnCount = ref(DEFAULT_DIMENSIONS.minColumns)

  const gridModel = computed<GridModel>(() => ({
    cells: cells.value,
    rowCount: rowCount.value,
    columnCount: columnCount.value
  }))

  function initializeGrid(rows = DEFAULT_DIMENSIONS.minRows, cols = DEFAULT_DIMENSIONS.minColumns) {
    const newGrid: GridCell[][] = []

    for (let r = 0; r < rows; r++) {
      const row: GridCell[] = []
      for (let c = 0; c < cols; c++) {
        row.push(createEmptyCell())
      }
      newGrid.push(row)
    }

    cells.value = newGrid
    rowCount.value = rows
    columnCount.value = cols
  }

  function ensureSize(targetRow: number, targetCol: number) {
    const newRowCount = Math.max(rowCount.value, targetRow + 1)
    const newColCount = Math.max(columnCount.value, targetCol + 1)

    if (newRowCount > rowCount.value || newColCount > columnCount.value) {
      const newCells = [...cells.value]

      for (let r = 0; r < newRowCount; r++) {
        if (!newCells[r]) {
          newCells[r] = []
        }
        for (let c = newCells[r].length; c < newColCount; c++) {
          newCells[r][c] = createEmptyCell()
        }
      }

      cells.value = newCells
      rowCount.value = newRowCount
      columnCount.value = newColCount
    }
  }

  function getCell(coord: CellCoordinate): GridCell | null {
    return cells.value[coord.row]?.[coord.col] || null
  }

  function setCell(coord: CellCoordinate, value: string | number, formula?: string) {
    ensureSize(coord.row, coord.col)
    const cell = cells.value[coord.row][coord.col]
    cell.value = value
    cell.formula = formula
    cell.display = formula ? String(value) : String(value)
  }

  function clearCell(coord: CellCoordinate) {
    const cell = getCell(coord)
    if (cell) {
      cell.value = ''
      cell.formula = undefined
      cell.display = ''
      cell.error = undefined
    }
  }

  return {
    gridModel,
    cells,
    rowCount,
    columnCount,
    initializeGrid,
    ensureSize,
    getCell,
    setCell,
    clearCell
  }
}
