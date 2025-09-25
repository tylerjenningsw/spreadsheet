import { GridCell } from '../types/grid'

export class CsvService {
  static parse(csvText: string): GridCell[][] {
    const rows = csvText.split(/\r?\n/).filter(row => row.length > 0)
    const result: GridCell[][] = []

    for (const row of rows) {
      const cells = this.parseCSVLine(row)
      result.push(cells.map(value => ({
        value: this.parseValue(value),
        display: value
      })))
    }

    return result
  }

  static generate(data: GridCell[][]): string {
    return data.map(row =>
      row.map(cell => this.escapeCSVValue(cell.value?.toString() || '')).join(',')
    ).join('\n')
  }

  private static parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      const nextChar = line[i + 1]

      if (inQuotes) {
        if (char === '"' && nextChar === '"') {
          current += '"'
          i++
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === ',') {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }

    result.push(current)
    return result
  }

  private static escapeCSVValue(value: string): string {
    if (value.includes(',') || value.includes('"') || value.includes('\n')) {
      return `"${value.replace(/"/g, '""')}"`
    }
    return value
  }

  private static parseValue(value: string): string | number {
    const trimmed = value.trim()

    if (trimmed === '') return ''

    const num = Number(trimmed)
    if (!isNaN(num) && trimmed !== '') {
      return num
    }

    return value
  }

  static downloadCSV(data: GridCell[][], filename = 'spreadsheet.csv') {
    const csvContent = this.generate(data)
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}