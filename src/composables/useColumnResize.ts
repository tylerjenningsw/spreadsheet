import { ref, reactive } from 'vue'

interface ResizeState {
  isResizing: boolean
  columnIndex: number
  startX: number
  startWidth: number
}

export function useColumnResize() {
  const DEFAULT_WIDTH = 100
  const MIN_WIDTH = 50

  const columnWidths = reactive<Record<number, number>>({})
  const resizeState = ref<ResizeState>({
    isResizing: false,
    columnIndex: -1,
    startX: 0,
    startWidth: DEFAULT_WIDTH
  })

  function getColumnWidth(index: number): number {
    return columnWidths[index] || DEFAULT_WIDTH
  }

  function setColumnWidth(index: number, width: number) {
    columnWidths[index] = Math.max(MIN_WIDTH, width)
  }

  function startResize(columnIndex: number, event: MouseEvent) {
    resizeState.value = {
      isResizing: true,
      columnIndex,
      startX: event.clientX,
      startWidth: getColumnWidth(columnIndex)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  function handleMouseMove(event: MouseEvent) {
    if (!resizeState.value.isResizing) return

    const deltaX = event.clientX - resizeState.value.startX
    const newWidth = resizeState.value.startWidth + deltaX
    setColumnWidth(resizeState.value.columnIndex, newWidth)
  }

  function handleMouseUp() {
    resizeState.value.isResizing = false
    resizeState.value.columnIndex = -1

    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.style.cursor = ''
    document.body.style.userSelect = ''
  }

  for (let i = 0; i < 100; i++) {
    columnWidths[i] = DEFAULT_WIDTH
  }

  return {
    columnWidths,
    getColumnWidth,
    setColumnWidth,
    startResize,
    isResizing: () => resizeState.value.isResizing
  }
}
