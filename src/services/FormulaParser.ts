import { FormulaToken, ParsedFormula } from '../types/formula'
import { columnLabelToIndex } from '../utils/columnHelpers'

export class FormulaParser {
  static parse(formula: string): ParsedFormula {
    if (!formula.startsWith('=')) {
      throw new Error('Formula must start with =')
    }

    const expression = formula.substring(1).trim()
    const tokens = this.tokenize(expression)
    const dependencies = this.extractDependencies(tokens)

    return {
      expression,
      tokens,
      dependencies
    }
  }

  private static tokenize(expression: string): FormulaToken[] {
    const tokens: FormulaToken[] = []
    let current = ''
    let i = 0

    while (i < expression.length) {
      const char = expression[i]

      if (/\s/.test(char)) {
        i++
        continue
      }

      if (/[A-Z]/.test(char)) {
        current = char
        i++
        while (i < expression.length && /[A-Z0-9]/.test(expression[i])) {
          current += expression[i]
          i++
        }
        if (this.isCellReference(current)) {
          tokens.push({ type: 'cellRef', value: current })
        } else {
          tokens.push({ type: 'function', value: current })
        }
        current = ''
        continue
      }

      if (/[0-9]/.test(char) || char === '.') {
        current = char
        i++
        while (i < expression.length && (/[0-9]/.test(expression[i]) || expression[i] === '.')) {
          current += expression[i]
          i++
        }
        tokens.push({ type: 'number', value: current })
        current = ''
        continue
      }

      if (['+', '-', '*', '/', '^'].includes(char)) {
        tokens.push({ type: 'operator', value: char })
        i++
        continue
      }

      if (char === '(') {
        tokens.push({ type: 'leftParen', value: char })
        i++
        continue
      }

      if (char === ')') {
        tokens.push({ type: 'rightParen', value: char })
        i++
        continue
      }

      i++
    }

    return tokens
  }

  private static isCellReference(text: string): boolean {
    return /^[A-Z]+[0-9]+$/.test(text)
  }

  private static extractDependencies(tokens: FormulaToken[]): Set<string> {
    const deps = new Set<string>()

    for (const token of tokens) {
      if (token.type === 'cellRef') {
        deps.add(token.value)
      }
    }

    return deps
  }

  static parseCellReference(ref: string): { row: number; col: number } | null {
    const match = ref.match(/^([A-Z]+)([0-9]+)$/)
    if (!match) return null

    const colLabel = match[1]
    const rowNum = parseInt(match[2], 10) - 1

    if (rowNum < 0) return null

    const colNum = columnLabelToIndex(colLabel)

    return { row: rowNum, col: colNum }
  }
}