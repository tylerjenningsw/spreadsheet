export function columnIndexToLabel(index: number): string {
  let label = ''
  let num = index

  while (num >= 0) {
    label = String.fromCharCode(65 + (num % 26)) + label
    num = Math.floor(num / 26) - 1
  }

  return label
}

export function columnLabelToIndex(label: string): number {
  let index = 0

  for (let i = 0; i < label.length; i++) {
    const charCode = label.charCodeAt(i) - 65
    index = index * 26 + charCode + (i > 0 ? 1 : 0)
  }

  return index
}
