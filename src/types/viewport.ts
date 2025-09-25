export interface VirtualViewport {
  rowStart: number
  rowEnd: number
  colStart: number
  colEnd: number
  scrollTop: number
  scrollLeft: number
}

export interface ScrollOffsets {
  x: number
  y: number
}

export interface CellDimensions {
  width: number
  height: number
}

export const DEFAULT_CELL_DIMENSIONS: CellDimensions = {
  width: 100,
  height: 30
}