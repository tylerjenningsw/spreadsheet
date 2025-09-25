import { FormulaToken, FormulaEvaluationResult } from '../types/formula'
import { GridCell } from '../types/grid'
import { FormulaParser } from './FormulaParser'

export class FormulaEvaluator {
  private visitedCells = new Set<string>()

  constructor(
    private getCell: (row: number, col: number) => GridCell | null
  ) {}

  evaluate(formula: string, currentCellId?: string): FormulaEvaluationResult {
    try {
      if (currentCellId) {
        if (this.visitedCells.has(currentCellId)) {
          return { value: '#CIRCULAR!', error: 'Circular reference detected' }
        }
        this.visitedCells.add(currentCellId)
      }

      const parsed = FormulaParser.parse(formula)
      const result = this.evaluateExpression(parsed.tokens)

      if (currentCellId) {
        this.visitedCells.delete(currentCellId)
      }

      return { value: result }
    } catch (error) {
      return { value: '#ERROR!', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private evaluateExpression(tokens: FormulaToken[]): number | string {
    const postfix = this.infixToPostfix(tokens)
    return this.evaluatePostfix(postfix)
  }

  private infixToPostfix(tokens: FormulaToken[]): FormulaToken[] {
    const output: FormulaToken[] = []
    const stack: FormulaToken[] = []
    const precedence: Record<string, number> = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
      '^': 3
    }

    for (const token of tokens) {
      if (token.type === 'number' || token.type === 'cellRef') {
        output.push(token)
      } else if (token.type === 'operator') {
        while (
          stack.length > 0 &&
          stack[stack.length - 1].type === 'operator' &&
          precedence[stack[stack.length - 1].value] >= precedence[token.value]
        ) {
          output.push(stack.pop()!)
        }
        stack.push(token)
      } else if (token.type === 'leftParen') {
        stack.push(token)
      } else if (token.type === 'rightParen') {
        while (stack.length > 0 && stack[stack.length - 1].type !== 'leftParen') {
          output.push(stack.pop()!)
        }
        if (stack.length > 0 && stack[stack.length - 1].type === 'leftParen') {
          stack.pop()
        }
      } else if (token.type === 'function') {
        stack.push(token)
      }
    }

    while (stack.length > 0) {
      output.push(stack.pop()!)
    }

    return output
  }

  private evaluatePostfix(tokens: FormulaToken[]): number {
    const stack: number[] = []

    for (const token of tokens) {
      if (token.type === 'number') {
        stack.push(parseFloat(token.value))
      } else if (token.type === 'cellRef') {
        const cellValue = this.getCellValue(token.value)
        stack.push(cellValue)
      } else if (token.type === 'operator') {
        if (stack.length < 2) {
          throw new Error('Invalid expression')
        }
        const b = stack.pop()!
        const a = stack.pop()!
        const result = this.applyOperator(token.value, a, b)
        stack.push(result)
      } else if (token.type === 'function') {
        const result = this.evaluateFunction(token.value, stack)
        stack.push(result)
      }
    }

    if (stack.length !== 1) {
      throw new Error('Invalid expression')
    }

    return stack[0]
  }

  private getCellValue(ref: string): number {
    const coord = FormulaParser.parseCellReference(ref)
    if (!coord) {
      throw new Error(`Invalid cell reference: ${ref}`)
    }

    const cell = this.getCell(coord.row, coord.col)
    if (!cell) {
      return 0
    }

    if (cell.formula) {
      const cellId = `${coord.row}-${coord.col}`
      const result = this.evaluate(cell.formula, cellId)
      if (typeof result.value === 'number') {
        return result.value
      }
      return 0
    }

    const value = cell.value
    if (typeof value === 'number') {
      return value
    }
    if (typeof value === 'string') {
      const num = parseFloat(value)
      return isNaN(num) ? 0 : num
    }
    return 0
  }

  private applyOperator(operator: string, a: number, b: number): number {
    switch (operator) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '*':
        return a * b
      case '/':
        if (b === 0) {
          throw new Error('Division by zero')
        }
        return a / b
      case '^':
        return Math.pow(a, b)
      default:
        throw new Error(`Unknown operator: ${operator}`)
    }
  }

  private evaluateFunction(funcName: string, stack: number[]): number {
    switch (funcName.toUpperCase()) {
      case 'SUM':
        return stack.reduce((a, b) => a + b, 0)
      case 'AVG':
      case 'AVERAGE':
        return stack.length > 0 ? stack.reduce((a, b) => a + b, 0) / stack.length : 0
      case 'MIN':
        return Math.min(...stack)
      case 'MAX':
        return Math.max(...stack)
      case 'COUNT':
        return stack.length
      default:
        throw new Error(`Unknown function: ${funcName}`)
    }
  }
}