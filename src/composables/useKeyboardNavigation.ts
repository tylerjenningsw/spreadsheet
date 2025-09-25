import { CellCoordinate } from '../types/grid'

export function useKeyboardNavigation() {
  let activeCell: CellCoordinate | null = null
  let selectCell: (coord: CellCoordinate, extend?: boolean) => void
  let startEditing: (row: number, col: number, initialValue?: string) => void
  let rowCount = 0
  let columnCount = 0
  let copySelection: () => void
  let pasteSelection: () => void
  let cutSelection: () => void
  let undoAction: () => void
  let redoAction: () => void

  function handleKeyDown(event: KeyboardEvent) {
    if (!activeCell) return

    const target = event.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

    const { row, col } = activeCell
    let newRow = row
    let newCol = col
    let handled = false

    switch (event.key) {
      case 'ArrowUp':
        if (newRow > 0) {
          newRow--
          handled = true
        }
        break
      case 'ArrowDown':
        if (newRow < rowCount - 1) {
          newRow++
          handled = true
        }
        break
      case 'ArrowLeft':
        if (newCol > 0) {
          newCol--
          handled = true
        }
        break
      case 'ArrowRight':
        if (newCol < columnCount - 1) {
          newCol++
          handled = true
        }
        break
      case 'Tab':
        event.preventDefault()
        if (event.shiftKey) {
          if (newCol > 0) {
            newCol--
          } else if (newRow > 0) {
            newRow--
            newCol = columnCount - 1
          }
        } else {
          if (newCol < columnCount - 1) {
            newCol++
          } else if (newRow < rowCount - 1) {
            newRow++
            newCol = 0
          }
        }
        handled = true
        break
      case 'Enter':
        event.preventDefault()
        if (!event.ctrlKey && !event.altKey) {
          startEditing(row, col)
        }
        return
      case 'F2':
        event.preventDefault()
        startEditing(row, col)
        return
      case 'Delete':
      case 'Backspace':
        event.preventDefault()
        startEditing(row, col, '')
        return
      case 'Home':
        if (event.ctrlKey) {
          newRow = 0
          newCol = 0
        } else {
          newCol = 0
        }
        handled = true
        break
      case 'End':
        if (event.ctrlKey) {
          newRow = rowCount - 1
          newCol = columnCount - 1
        } else {
          newCol = columnCount - 1
        }
        handled = true
        break
      case 'PageUp':
        newRow = Math.max(0, newRow - 10)
        handled = true
        break
      case 'PageDown':
        newRow = Math.min(rowCount - 1, newRow + 10)
        handled = true
        break
      case 'c':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          copySelection()
          return
        }
        break
      case 'x':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          cutSelection()
          return
        }
        break
      case 'v':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          pasteSelection()
          return
        }
        break
      case 'z':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          if (event.shiftKey) {
            redoAction()
          } else {
            undoAction()
          }
          return
        }
        break
      case 'y':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault()
          redoAction()
          return
        }
        break
      default:
        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
          startEditing(row, col, event.key)
          return
        }
    }

    if (handled) {
      event.preventDefault()
      selectCell({ row: newRow, col: newCol }, event.shiftKey)
      activeCell = { row: newRow, col: newCol }
    }
  }

  function setupKeyboardHandlers(options: {
    activeCellGetter: () => CellCoordinate | null
    selectCellFn: (coord: CellCoordinate, extend?: boolean) => void
    startEditingFn: (row: number, col: number, initialValue?: string) => void
    rowCountGetter: () => number
    columnCountGetter: () => number
    copySelectionFn: () => void
    pasteSelectionFn: () => void
    cutSelectionFn: () => void
    undoFn: () => void
    redoFn: () => void
  }) {
    selectCell = options.selectCellFn
    startEditing = options.startEditingFn
    copySelection = options.copySelectionFn
    pasteSelection = options.pasteSelectionFn
    cutSelection = options.cutSelectionFn
    undoAction = options.undoFn
    redoAction = options.redoFn

    const updateState = () => {
      activeCell = options.activeCellGetter()
      rowCount = options.rowCountGetter()
      columnCount = options.columnCountGetter()
    }

    const wrappedHandler = (event: KeyboardEvent) => {
      updateState()
      handleKeyDown(event)
    }

    document.addEventListener('keydown', wrappedHandler)

    return () => {
      document.removeEventListener('keydown', wrappedHandler)
    }
  }

  function cleanupHandlers() {}

  return {
    setupKeyboardHandlers,
    cleanupHandlers
  }
}
