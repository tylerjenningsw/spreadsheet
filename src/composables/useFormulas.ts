import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import { GridCell } from '../types/grid'
import { FormulaEvaluator } from '../services/FormulaEvaluator'
import { FormulaParser } from '../services/FormulaParser'

export function useFormulas(cells: Ref<GridCell[][]>) {
  const formulaCells = ref(new Map<string, string>())
  const dependencyGraph = ref(new Map<string, Set<string>>())

  function getCellById(row: number, col: number): GridCell | null {
    return cells.value[row]?.[col] || null
  }

  const evaluator = new FormulaEvaluator(getCellById)

  function evaluateFormula(formula: string, row: number, col: number): void {
    const cell = cells.value[row][col]
    if (!cell) return

    const result = evaluator.evaluate(formula, `${row}-${col}`)

    if (result.error) {
      cell.value = result.value
      cell.error = result.error
      cell.display = result.value.toString()
    } else {
      cell.value = result.value
      cell.error = undefined
      cell.display = typeof result.value === 'number'
        ? result.value.toFixed(2).replace(/\.?0+$/, '')
        : result.value.toString()
    }
  }

  function updateFormula(row: number, col: number, formula: string): void {
    const cellId = `${row}-${col}`

    if (formula.startsWith('=')) {
      formulaCells.value.set(cellId, formula)
      updateDependencyGraph(cellId, formula)
      evaluateFormula(formula, row, col)
      recalculateDependents(cellId)
    } else {
      formulaCells.value.delete(cellId)
      clearDependencies(cellId)
    }
  }

  function updateDependencyGraph(cellId: string, formula: string): void {
    clearDependencies(cellId)

    try {
      const parsed = FormulaParser.parse(formula)

      for (const dep of parsed.dependencies) {
        const depCoord = FormulaParser.parseCellReference(dep)
        if (depCoord) {
          const depId = `${depCoord.row}-${depCoord.col}`
          if (!dependencyGraph.value.has(depId)) {
            dependencyGraph.value.set(depId, new Set())
          }
          dependencyGraph.value.get(depId)!.add(cellId)
        }
      }
    } catch (error) {
      console.error('Error parsing formula dependencies:', error)
    }
  }

  function clearDependencies(cellId: string): void {
    for (const [_, dependents] of dependencyGraph.value) {
      dependents.delete(cellId)
    }
  }

  function recalculateDependents(cellId: string): void {
    const dependents = dependencyGraph.value.get(cellId)
    if (!dependents) return

    const visited = new Set<string>()
    const queue = Array.from(dependents)

    while (queue.length > 0) {
      const depId = queue.shift()!
      if (visited.has(depId)) continue
      visited.add(depId)

      const [row, col] = depId.split('-').map(Number)
      const formula = formulaCells.value.get(depId)

      if (formula) {
        evaluateFormula(formula, row, col)
      }

      const nextDependents = dependencyGraph.value.get(depId)
      if (nextDependents) {
        queue.push(...Array.from(nextDependents))
      }
    }
  }

  watch(cells, () => {
    for (const [cellId, formula] of formulaCells.value) {
      const [row, col] = cellId.split('-').map(Number)
      evaluateFormula(formula, row, col)
    }
  }, { deep: true })

  return {
    updateFormula,
    evaluateFormula,
    formulaCells,
    dependencyGraph
  }
}