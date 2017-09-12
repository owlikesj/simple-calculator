class BasicExpression {
  constructor (operator, ...operands) {
    this.operator = operator
    this.operands = operands
    this.validate()
  }
  validate () {
    const operator = this.operator
    const needNum = BasicExpression.operandsNumOf(operator)
    let operands = this.operands
    if (operator === '-' && operands.length === 1) {
      operands.unshift(0)
    }
    if (needNum !== operands.length) {
      throw `The ${operator} operation require ${needNum} operand${needNum > 1 ? 's' : ''}`
    }
    operands.forEach(operand => {
      if (!BasicExpression.isValidOperand(operand)) {
        throw `${JSON.stringify(operand)} is not a valid operand`
      }
    })
  }
  getResult () {
    let operands = this.operands
    operands = operands.map(operand =>
            operand instanceof BasicExpression
            ? operand.getResult() : operand)
    switch (this.operator) {
      case '+':
        return operands[0] + operands[1]
      case '-':
        return operands[0] - operands[1]
      case '×':
        return operands[0] * operands[1]
      case '÷':
        return operands[0] / operands[1]
      case '%':
        return operands[0] / 100
    }
  }
  static isValidOperand (operand) {
    return typeof operand === 'number' || operand instanceof BasicExpression
  }
  static operandsNumOf (operator) {
    switch (operator) {
      case '%':
        return 1
      case '+':
      case '-':
      case '×':
      case '÷':
        return 2
    }
  }
}

export default BasicExpression
