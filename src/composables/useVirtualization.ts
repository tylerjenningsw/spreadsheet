import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { VirtualViewport, DEFAULT_CELL_DIMENSIONS } from '../types/viewport'

export function useVirtualization(
  containerRef: Ref<HTMLElement | undefined>,
  rowCount: Ref<number>,
  columnCount: Ref<number>,
  columnWidths: Record<number, number>
) {
  const scrollTop = ref(0)
  const scrollLeft = ref(0)
  const containerHeight = ref(0)
  const containerWidth = ref(0)

  const ROW_HEIGHT = DEFAULT_CELL_DIMENSIONS.height
  const HEADER_HEIGHT = 30
  const ROW_HEADER_WIDTH = 50
  const BUFFER_ROWS = 5
  const BUFFER_COLS = 3

  const virtualViewport = computed<VirtualViewport>(() => {
    const firstVisibleRow = Math.floor(scrollTop.value / ROW_HEIGHT)
    const lastVisibleRow = Math.ceil((scrollTop.value + containerHeight.value) / ROW_HEIGHT)

    let accumulatedWidth = 0
    let firstVisibleCol = 0
    let lastVisibleCol = columnCount.value - 1

    for (let col = 0; col < columnCount.value; col++) {
      const colWidth = columnWidths[col] || DEFAULT_CELL_DIMENSIONS.width
      if (accumulatedWidth < scrollLeft.value) {
        firstVisibleCol = col
      }
      if (accumulatedWidth < scrollLeft.value + containerWidth.value) {
        lastVisibleCol = col
      }
      accumulatedWidth += colWidth
    }

    return {
      rowStart: Math.max(0, firstVisibleRow - BUFFER_ROWS),
      rowEnd: Math.min(rowCount.value - 1, lastVisibleRow + BUFFER_ROWS),
      colStart: Math.max(0, firstVisibleCol - BUFFER_COLS),
      colEnd: Math.min(columnCount.value - 1, lastVisibleCol + BUFFER_COLS),
      scrollTop: scrollTop.value,
      scrollLeft: scrollLeft.value
    }
  })

  const totalHeight = computed(() => rowCount.value * ROW_HEIGHT + HEADER_HEIGHT)

  const totalWidth = computed(() => {
    let width = ROW_HEADER_WIDTH
    for (let col = 0; col < columnCount.value; col++) {
      width += columnWidths[col] || DEFAULT_CELL_DIMENSIONS.width
    }
    return width
  })

  const topSpacerHeight = computed(() => virtualViewport.value.rowStart * ROW_HEIGHT)

  const bottomSpacerHeight = computed(
    () => (rowCount.value - virtualViewport.value.rowEnd - 1) * ROW_HEIGHT
  )

  const leftSpacerWidth = computed(() => {
    let width = 0
    for (let col = 0; col < virtualViewport.value.colStart; col++) {
      width += columnWidths[col] || DEFAULT_CELL_DIMENSIONS.width
    }
    return width
  })

  const rightSpacerWidth = computed(() => {
    let width = 0
    for (let col = virtualViewport.value.colEnd + 1; col < columnCount.value; col++) {
      width += columnWidths[col] || DEFAULT_CELL_DIMENSIONS.width
    }
    return width
  })

  function handleScroll(event: Event) {
    const target = event.target as HTMLElement
    scrollTop.value = target.scrollTop
    scrollLeft.value = target.scrollLeft
  }

  function updateContainerDimensions() {
    if (!containerRef.value) return
    containerHeight.value = containerRef.value.clientHeight
    containerWidth.value = containerRef.value.clientWidth
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    updateContainerDimensions()

    if (containerRef.value) {
      containerRef.value.addEventListener('scroll', handleScroll)

      resizeObserver = new ResizeObserver(() => {
        updateContainerDimensions()
      })
      resizeObserver.observe(containerRef.value)
    }
  })

  onUnmounted(() => {
    if (containerRef.value) {
      containerRef.value.removeEventListener('scroll', handleScroll)
    }
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })

  return {
    virtualViewport,
    totalHeight,
    totalWidth,
    topSpacerHeight,
    bottomSpacerHeight,
    leftSpacerWidth,
    rightSpacerWidth,
    scrollTop,
    scrollLeft
  }
}
