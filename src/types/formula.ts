export type FormulaTokenType =
  | 'number'
  | 'cellRef'
  | 'operator'
  | 'function'
  | 'leftParen'
  | 'rightParen'

export interface FormulaToken {
  type: FormulaTokenType
  value: string
}

export interface ParsedFormula {
  expression: string
  tokens: FormulaToken[]
  dependencies: Set<string>
}

export interface FormulaEvaluationResult {
  value: number | string
  error?: string
}
