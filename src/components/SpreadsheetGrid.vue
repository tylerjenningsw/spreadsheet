<template>
  <div ref="containerRef" class="spreadsheet-container">
    <div
      ref="wrapperRef"
      class="spreadsheet-wrapper"
      @mouseup="handleMouseUp"
      @mousemove="handleGlobalMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <table class="table table-bordered spreadsheet-grid">
        <colgroup>
          <col class="row-header-col" :style="{ width: '50px' }" />
          <col
            v-for="col in columnCount"
            :key="col - 1"
            :style="{ width: columnWidths[col - 1] + 'px' }"
          />
        </colgroup>
        <thead>
          <tr>
            <th class="corner-header"></th>
            <th
              v-for="col in columnCount"
              :key="col - 1"
              class="column-header"
              :class="{ 'column-selected': isColumnSelected(col - 1) }"
            >
              <div class="column-header-content">
                <span>{{ columnIndexToLabel(col - 1) }}</span>
                <div
                  class="column-resize-handle"
                  @mousedown.stop="startColumnResize(col - 1, $event)"
                ></div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rowCount" :key="row - 1">
            <td class="row-header" :class="{ 'row-selected': isRowSelected(row - 1) }">
              {{ row }}
            </td>
            <td
              v-for="col in columnCount"
              :key="col - 1"
              class="grid-cell"
              :class="{
                'cell-selected': isCellSelected({ row: row - 1, col: col - 1 }),
                'cell-active': isCellActive({ row: row - 1, col: col - 1 }),
                'cell-editing': isEditing(row - 1, col - 1)
              }"
              :data-row="row - 1"
              :data-col="col - 1"
              @mousedown="handleCellMouseDown(row - 1, col - 1, $event)"
              @mousemove="handleCellMouseMove(row - 1, col - 1)"
              @dblclick="startEditing(row - 1, col - 1)"
            >
              <div v-if="!isEditing(row - 1, col - 1)" class="cell-content">
                {{ getCellDisplay(row - 1, col - 1) }}
              </div>
              <CellEditor
                v-else
                :value="getCellValue(row - 1, col - 1)"
                @update="handleCellUpdate(row - 1, col - 1, $event)"
                @cancel="cancelEditing"
                @navigate="handleEditorNavigate"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useGridModel } from '../composables/useGridModel'
import { useSelection } from '../composables/useSelection'
import { useKeyboardNavigation } from '../composables/useKeyboardNavigation'
import { useClipboard } from '../composables/useClipboard'
import { useColumnResize } from '../composables/useColumnResize'
import { useFormulas } from '../composables/useFormulas'
import { useHistory } from '../composables/useHistory'
import { columnIndexToLabel } from '../utils/columnHelpers'
import { CellCoordinate, GridCell } from '../types/grid'
import { ActionType, HistoryAction } from '../types/history'
import type { NavigationDirection } from '../types/navigation'
import CellEditor from './CellEditor.vue'

const { cells, rowCount, columnCount, initializeGrid, getCell, setCell, ensureSize } =
  useGridModel()

const {
  activeCell,
  isCellSelected,
  isCellActive,
  selectCell,
  startRangeSelection,
  updateRangeSelection,
  endRangeSelection,
  currentRange,
  isSelecting
} = useSelection()

const { columnWidths, startResize } = useColumnResize()
const { setupKeyboardHandlers, cleanupHandlers } = useKeyboardNavigation()
const { setupClipboardHandlers } = useClipboard()

const editingCell = ref<CellCoordinate | null>(null)
const containerRef = ref<HTMLElement>()
const wrapperRef = ref<HTMLElement>()
const isDragging = ref(false)
const dragScrollInterval = ref<number | null>(null)
const { updateFormula } = useFormulas(cells)
const { canUndo, canRedo, undo, redo, recordCellChange, recordPaste } = useHistory()

// Define undo/redo functions early
function performUndo() {
  return undo(applyHistoryAction)
}

function performRedo() {
  return redo(applyHistoryAction)
}

function applyHistoryAction(action: HistoryAction, isUndo: boolean) {
  switch (action.type) {
    case ActionType.SET_CELL: {
      const snapshot = isUndo ? action.before : action.after
      if (snapshot.formula) {
        setCell({ row: snapshot.row, col: snapshot.col }, snapshot.value, snapshot.formula)
        updateFormula(snapshot.row, snapshot.col, snapshot.formula)
      } else {
        setCell({ row: snapshot.row, col: snapshot.col }, snapshot.value)
      }
      break
    }

    case ActionType.PASTE_RANGE:
    case ActionType.SET_RANGE: {
      const snapshot = isUndo ? action.before : action.after
      for (let r = 0; r < snapshot.cells.length; r++) {
        for (let c = 0; c < snapshot.cells[r].length; c++) {
          const cell = snapshot.cells[r][c]
          const targetRow = snapshot.startRow + r
          const targetCol = snapshot.startCol + c
          ensureSize(targetRow, targetCol)
          if (cell.formula) {
            setCell({ row: targetRow, col: targetCol }, cell.value, cell.formula)
            updateFormula(targetRow, targetCol, cell.formula)
          } else {
            setCell({ row: targetRow, col: targetCol }, cell.value)
          }
        }
      }
      break
    }

    case ActionType.CLEAR_CELL: {
      if (isUndo) {
        const snapshot = action.before
        if (snapshot.formula) {
          setCell({ row: snapshot.row, col: snapshot.col }, snapshot.value, snapshot.formula)
          updateFormula(snapshot.row, snapshot.col, snapshot.formula)
        } else {
          setCell({ row: snapshot.row, col: snapshot.col }, snapshot.value)
        }
      } else {
        setCell({ row: action.before.row, col: action.before.col }, '')
      }
      break
    }

    case ActionType.CLEAR_RANGE: {
      if (isUndo) {
        const snapshot = action.before
        for (let r = 0; r < snapshot.cells.length; r++) {
          for (let c = 0; c < snapshot.cells[r].length; c++) {
            const cell = snapshot.cells[r][c]
            const targetRow = snapshot.startRow + r
            const targetCol = snapshot.startCol + c
            if (cell.formula) {
              setCell({ row: targetRow, col: targetCol }, cell.value, cell.formula)
              updateFormula(targetRow, targetCol, cell.formula)
            } else {
              setCell({ row: targetRow, col: targetCol }, cell.value)
            }
          }
        }
      } else {
        const snapshot = action.before
        for (let r = 0; r < snapshot.cells.length; r++) {
          for (let c = 0; c < snapshot.cells[r].length; c++) {
            const targetRow = snapshot.startRow + r
            const targetCol = snapshot.startCol + c
            setCell({ row: targetRow, col: targetCol }, '')
          }
        }
      }
      break
    }

    case ActionType.RESIZE_COLUMN: {
      const width = isUndo ? action.before : action.after
      columnWidths[action.columnIndex] = width
      break
    }
  }
}

onMounted(() => {
  initializeGrid()

  const keyboardCleanup = setupKeyboardHandlers({
    activeCellGetter: () => activeCell.value,
    selectCellFn: selectCell,
    startEditingFn: startEditing,
    rowCountGetter: () => rowCount.value,
    columnCountGetter: () => columnCount.value,
    copySelectionFn: () => clipboardHandlers.copySelection(),
    pasteSelectionFn: () => clipboardHandlers.pasteSelection(),
    cutSelectionFn: () => clipboardHandlers.cutSelection(),
    undoFn: performUndo,
    redoFn: performRedo
  })

  const clipboardHandlers = setupClipboardHandlers({
    getSelectedRange: () => currentRange.value,
    getGridData: () => cells.value,
    pasteData: (data, startCoord) => {
      // Capture before state for undo
      const beforeCells: GridCell[][] = []
      for (let r = 0; r < data.length; r++) {
        beforeCells[r] = []
        for (let c = 0; c < data[r].length; c++) {
          const targetRow = startCoord.row + r
          const targetCol = startCoord.col + c
          ensureSize(targetRow, targetCol)
          const cell = getCell({ row: targetRow, col: targetCol })
          beforeCells[r][c] = cell ? { ...cell } : { value: '', display: '' }
        }
      }

      // Apply paste
      for (let r = 0; r < data.length; r++) {
        for (let c = 0; c < data[r].length; c++) {
          const targetRow = startCoord.row + r
          const targetCol = startCoord.col + c
          setCell({ row: targetRow, col: targetCol }, data[r][c].value)
        }
      }

      // Capture after state
      const afterCells: GridCell[][] = []
      for (let r = 0; r < data.length; r++) {
        afterCells[r] = []
        for (let c = 0; c < data[r].length; c++) {
          const targetRow = startCoord.row + r
          const targetCol = startCoord.col + c
          const cell = getCell({ row: targetRow, col: targetCol })
          afterCells[r][c] = cell ? { ...cell } : { value: '', display: '' }
        }
      }

      recordPaste(startCoord.row, startCoord.col, beforeCells, afterCells)
    }
  })

  onUnmounted(() => {
    keyboardCleanup()
    cleanupHandlers()
    stopDragScroll()
  })
})

function handleCellMouseDown(row: number, col: number, event: MouseEvent) {
  const coord = { row, col }

  if (event.shiftKey && activeCell.value) {
    updateRangeSelection(coord)
  } else {
    startRangeSelection(coord)
  }

  if (editingCell.value) {
    commitEdit()
  }

  isDragging.value = true
}

function handleCellMouseMove(row: number, col: number) {
  if (isSelecting.value || isDragging.value) {
    // Ensure grid is large enough
    ensureSize(row, col)
    updateRangeSelection({ row, col })
  }
}

function handleMouseUp() {
  endRangeSelection()
  isDragging.value = false
  stopDragScroll()
}

function handleMouseLeave() {
  // Don't stop dragging when mouse leaves, to allow expansion
}

function handleGlobalMouseMove(event: MouseEvent) {
  if (!isDragging.value || !isSelecting.value) return
  if (!wrapperRef.value) return

  const rect = wrapperRef.value.getBoundingClientRect()
  const scrollTop = wrapperRef.value.scrollTop
  const scrollLeft = wrapperRef.value.scrollLeft

  // Calculate position relative to the grid
  const relativeX = event.clientX - rect.left + scrollLeft
  const relativeY = event.clientY - rect.top + scrollTop

  // Calculate which cell we're over (including beyond current grid)
  const HEADER_HEIGHT = 30
  const ROW_HEIGHT = 30
  const ROW_HEADER_WIDTH = 50

  let targetRow = Math.floor((relativeY - HEADER_HEIGHT) / ROW_HEIGHT)

  // Calculate column based on actual column widths
  let targetCol = -1
  let accumulatedWidth = ROW_HEADER_WIDTH

  for (let c = 0; c < columnCount.value + 20; c++) {
    // Check beyond current grid
    const colWidth = columnWidths[c] || 100
    if (relativeX < accumulatedWidth + colWidth) {
      targetCol = c
      break
    }
    accumulatedWidth += colWidth
  }

  if (targetCol === -1) {
    // Beyond all columns, estimate based on default width
    targetCol = Math.floor((relativeX - accumulatedWidth) / 100) + columnCount.value
  }

  // Clamp to minimum values
  targetRow = Math.max(0, targetRow)
  targetCol = Math.max(0, targetCol)

  // Expand grid if needed
  const EXPANSION_BUFFER = 5
  if (targetRow >= rowCount.value - 1) {
    const newRowCount = targetRow + EXPANSION_BUFFER
    ensureSize(newRowCount, columnCount.value - 1)
  }
  if (targetCol >= columnCount.value - 1) {
    const newColCount = targetCol + EXPANSION_BUFFER
    ensureSize(rowCount.value - 1, newColCount)
  }

  // Update selection if within expanded grid
  if (targetRow < rowCount.value && targetCol < columnCount.value) {
    updateRangeSelection({ row: targetRow, col: targetCol })
  }

  // Auto-scroll if near edges
  handleAutoScroll(event, rect)
}

function handleAutoScroll(event: MouseEvent, rect: DOMRect) {
  if (!wrapperRef.value) return

  const SCROLL_ZONE = 50
  const SCROLL_SPEED = 10

  let scrollX = 0
  let scrollY = 0

  // Check if near edges
  if (event.clientY - rect.top < SCROLL_ZONE) {
    scrollY = -SCROLL_SPEED
  } else if (rect.bottom - event.clientY < SCROLL_ZONE) {
    scrollY = SCROLL_SPEED
  }

  if (event.clientX - rect.left < SCROLL_ZONE) {
    scrollX = -SCROLL_SPEED
  } else if (rect.right - event.clientX < SCROLL_ZONE) {
    scrollX = SCROLL_SPEED
  }

  if (scrollX !== 0 || scrollY !== 0) {
    startDragScroll(scrollX, scrollY)
  } else {
    stopDragScroll()
  }
}

function startDragScroll(scrollX: number, scrollY: number) {
  if (dragScrollInterval.value) return

  dragScrollInterval.value = window.setInterval(() => {
    if (!wrapperRef.value) return
    wrapperRef.value.scrollLeft += scrollX
    wrapperRef.value.scrollTop += scrollY
  }, 16) // ~60fps
}

function stopDragScroll() {
  if (dragScrollInterval.value) {
    window.clearInterval(dragScrollInterval.value)
    dragScrollInterval.value = null
  }
}

function startColumnResize(colIndex: number, event: MouseEvent) {
  startResize(colIndex, event)
}

function isColumnSelected(_col: number): boolean {
  return false
}

function isRowSelected(_row: number): boolean {
  return false
}

function getCellDisplay(row: number, col: number): string {
  const cell = getCell({ row, col })
  return cell?.display || cell?.value?.toString() || ''
}

function getCellValue(row: number, col: number): string {
  const cell = getCell({ row, col })
  return cell?.formula || cell?.value?.toString() || ''
}

function isEditing(row: number, col: number): boolean {
  return editingCell.value?.row === row && editingCell.value?.col === col
}

function startEditing(row: number, col: number, initialValue?: string) {
  selectCell({ row, col })
  editingCell.value = { row, col }

  if (initialValue !== undefined) {
    nextTick(() => {
      const cell = getCell({ row, col })
      if (cell) {
        cell.value = initialValue
      }
    })
  }
}

function handleCellUpdate(row: number, col: number, value: string) {
  // Record the change for undo
  const beforeCell = getCell({ row, col })
  const beforeSnapshot = beforeCell ? { ...beforeCell } : null

  if (value.startsWith('=')) {
    setCell({ row, col }, value, value)
    updateFormula(row, col, value)
  } else {
    setCell({ row, col }, value)
  }

  const afterCell = getCell({ row, col })
  recordCellChange(row, col, beforeSnapshot, afterCell)

  cancelEditing()
}

function cancelEditing() {
  editingCell.value = null
}

function commitEdit() {
  if (editingCell.value) {
    const value = getCellValue(editingCell.value.row, editingCell.value.col)
    handleCellUpdate(editingCell.value.row, editingCell.value.col, value)
  }
}

function handleEditorNavigate(direction: NavigationDirection) {
  if (!activeCell.value) return

  const { row, col } = activeCell.value
  let newRow = row
  let newCol = col

  switch (direction) {
    case 'up':
      if (newRow > 0) newRow--
      break
    case 'down':
      if (newRow < rowCount.value - 1) newRow++
      break
    case 'left':
      if (newCol > 0) newCol--
      break
    case 'right':
      if (newCol < columnCount.value - 1) newCol++
      break
  }

  selectCell({ row: newRow, col: newCol })
  nextTick(() => startEditing(newRow, newCol))
}

function exportData(): GridCell[][] {
  return cells.value
}

function importData(data: GridCell[][]) {
  for (let r = 0; r < data.length; r++) {
    for (let c = 0; c < data[r].length; c++) {
      ensureSize(r, c)
      const cell = data[r][c]
      if (cell.formula) {
        setCell({ row: r, col: c }, cell.value, cell.formula)
        updateFormula(r, c, cell.formula)
      } else {
        setCell({ row: r, col: c }, cell.value)
      }
    }
  }
}

defineExpose({
  exportData,
  importData,
  performUndo,
  performRedo,
  canUndo,
  canRedo
})
</script>

<style scoped>
.spreadsheet-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.spreadsheet-wrapper {
  width: 100%;
  height: 100%;
  overflow: auto;
  position: relative;
  scroll-behavior: smooth;
  overscroll-behavior: contain;
}

.spreadsheet-grid {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  user-select: none;
  font-size: 14px;
  margin: 0;
}

.corner-header {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  position: sticky;
  left: 0;
  z-index: 3;
}

.column-header {
  background-color: #f8f9fa;
  font-weight: 500;
  text-align: center;
  border: 1px solid #dee2e6;
  position: relative;
  padding: 0;
  height: 30px;
}

.column-header-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
  padding: 0 8px;
}

.column-resize-handle {
  position: absolute;
  right: -3px;
  top: 0;
  bottom: 0;
  width: 6px;
  cursor: col-resize;
  z-index: 2;
}

.column-resize-handle:hover {
  background-color: #007bff;
  opacity: 0.5;
}

.row-header {
  background-color: #f8f9fa;
  font-weight: 500;
  text-align: center;
  border: 1px solid #dee2e6;
  width: 50px;
  position: sticky;
  left: 0;
  z-index: 1;
}

.grid-cell {
  border: 1px solid #dee2e6;
  padding: 2px 4px;
  background-color: white;
  cursor: cell;
  position: relative;
  height: 30px;
  vertical-align: middle;
}

.cell-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cell-selected {
  background-color: #e3f2fd !important;
}

.cell-active {
  outline: 2px solid #007bff;
  outline-offset: -1px;
  z-index: 2;
}

.cell-editing {
  padding: 0;
}

.column-selected {
  background-color: #e3f2fd;
}

.row-selected {
  background-color: #e3f2fd;
}
</style>
