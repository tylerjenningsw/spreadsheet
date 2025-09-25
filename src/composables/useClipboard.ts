import { ref } from 'vue'
import { CellRange, GridCell } from '../types/grid'
import { extractRangeData } from '../utils/rangeHelpers'

export function useClipboard() {
  const clipboardData = ref<GridCell[][] | null>(null)
  const clipboardSource = ref<CellRange | null>(null)

  function serializeToTSV(data: GridCell[][]): string {
    return data.map(row => row.map(cell => cell.value?.toString() || '').join('\t')).join('\n')
  }

  function parseFromTSV(text: string): GridCell[][] {
    const rows = text.split(/\r?\n/)
    return rows.map(row => {
      const cells = row.split('\t')
      return cells.map(value => ({
        value: value,
        display: value
      }))
    })
  }

  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
  }

  async function readFromClipboard(): Promise<string> {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return ''
    }
  }

  function setupClipboardHandlers(options: {
    getSelectedRange: () => CellRange | null
    getGridData: () => GridCell[][]
    pasteData: (data: GridCell[][], startCoord: { row: number; col: number }) => void
  }) {
    const copySelection = async () => {
      const range = options.getSelectedRange()
      if (!range) return

      const gridData = options.getGridData()
      const data = extractRangeData(gridData, range)
      clipboardData.value = data
      clipboardSource.value = range

      const tsvText = serializeToTSV(data)
      await copyToClipboard(tsvText)
    }

    const cutSelection = async () => {
      await copySelection()
    }

    const pasteSelection = async () => {
      const text = await readFromClipboard()
      if (!text) return

      const data = parseFromTSV(text)
      const range = options.getSelectedRange()
      if (!range) return

      const startCoord = {
        row: Math.min(range.start.row, range.end.row),
        col: Math.min(range.start.col, range.end.col)
      }

      options.pasteData(data, startCoord)
    }

    return {
      copySelection,
      cutSelection,
      pasteSelection
    }
  }

  return {
    clipboardData,
    clipboardSource,
    setupClipboardHandlers
  }
}
