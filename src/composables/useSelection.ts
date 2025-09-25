import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import { CellCoordinate, CellRange } from '../types/grid'
import { SelectionState, SelectionBounds } from '../types/selection'
import { isCellInRange, normalizeRange } from '../utils/cellHelpers'
import { getRangeBounds } from '../utils/rangeHelpers'

export function useSelection() {
  const activeCell: Ref<CellCoordinate | null> = ref(null)
  const anchor: Ref<CellCoordinate | null> = ref(null)
  const focus: Ref<CellCoordinate | null> = ref(null)
  const selectedRanges: Ref<CellRange[]> = ref([])
  const isSelecting = ref(false)

  const selectionState = computed<SelectionState>(() => ({
    activeCell: activeCell.value,
    anchor: anchor.value,
    focus: focus.value,
    selectedRanges: selectedRanges.value,
    isSelecting: isSelecting.value
  }))

  const currentRange = computed<CellRange | null>(() => {
    if (!anchor.value || !focus.value) return null
    return normalizeRange({
      start: anchor.value,
      end: focus.value
    })
  })

  const selectionBounds = computed<SelectionBounds>(() => {
    const ranges = currentRange.value ? [currentRange.value] : selectedRanges.value
    return getRangeBounds(ranges)
  })

  function selectCell(coord: CellCoordinate, extend = false) {
    if (!extend || !activeCell.value) {
      activeCell.value = coord
      anchor.value = coord
      focus.value = coord
      selectedRanges.value = []
    } else {
      focus.value = coord
    }
  }

  function startRangeSelection(coord: CellCoordinate) {
    anchor.value = coord
    focus.value = coord
    activeCell.value = coord
    isSelecting.value = true
    selectedRanges.value = []
  }

  function updateRangeSelection(coord: CellCoordinate) {
    if (isSelecting.value && anchor.value) {
      focus.value = coord
    }
  }

  function endRangeSelection() {
    if (isSelecting.value && currentRange.value) {
      selectedRanges.value = [currentRange.value]
    }
    isSelecting.value = false
  }

  function clearSelection() {
    activeCell.value = null
    anchor.value = null
    focus.value = null
    selectedRanges.value = []
    isSelecting.value = false
  }

  function isCellSelected(coord: CellCoordinate): boolean {
    if (
      activeCell.value &&
      activeCell.value.row === coord.row &&
      activeCell.value.col === coord.col
    ) {
      return true
    }

    if (currentRange.value && isCellInRange(coord, currentRange.value)) {
      return true
    }

    return selectedRanges.value.some(range => isCellInRange(coord, range))
  }

  function isCellActive(coord: CellCoordinate): boolean {
    return activeCell.value?.row === coord.row && activeCell.value?.col === coord.col
  }

  return {
    selectionState,
    activeCell,
    anchor,
    focus,
    selectedRanges,
    isSelecting,
    currentRange,
    selectionBounds,
    selectCell,
    startRangeSelection,
    updateRangeSelection,
    endRangeSelection,
    clearSelection,
    isCellSelected,
    isCellActive
  }
}
