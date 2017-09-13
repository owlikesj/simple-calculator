class Expression {
  constructor (operator, ...operands) {
    this.operator = operator
    this.operands = operands
    this.validate()
  }
  validate () {
    const operator = this.operator
    let operands = this.operands
    if (operator && !isValidOperator(operator)) {
      throw '"${operator}" is not a valid operator'
    }
    if (operator) {
      const needNum = operandsNumOf(operator)
      if (!needNum.includes(operands.length)) {
        throw `The ${operator} operation require ${needNum.join(' or ')} operand${needNum[0] > 1 ? 's' : ''}`
      }
      operands.forEach(operand => {
        if (!isValidOperand(operand)) {
          throw `${JSON.stringify(operand)} is not a valid operand`
        }
      })
    } else {
      if (!operands.length) {
        throw `Empty operator require only one operand`
      }
      if (!isValidOperand(operands[0])) {
        throw `${JSON.stringify(operands[0])} is not a valid operand`
      }
    }
  }
  getResult () {
    const operator = this.operator
    let operands = this.operands
    if (!operator) {
      return operands[0]
    }
    operands = operands.map(operand =>
            operand instanceof Expression
            ? operand.getResult() : operand)
    switch (operator) {
      case '+':
        return operands[1] ? fixFloatCalc(operator, operands[0], operands[1]) : operands[0]
      case '-':
        return operands[1] ? fixFloatCalc(operator, operands[0], operands[1]) : -operands[0]
      case '×':
        return fixFloatCalc(operator, operands[0], operands[1])
      case '÷':
        return fixFloatCalc(operator, operands[0], operands[1])
      case '%':
        return operands[0] / 100
    }
  }
}

function isValidOperand (operand) {
  return typeof operand === 'number' || operand instanceof Expression
}
function isValidOperator (operator) {
  return ['+', '-', '×', '÷', '%'].includes(operator)
}
function precedence (operator) {
  switch (operator) {
    case '%':
      return 1
    case '+':
    case '-':
      return 2
    case '×':
    case '÷':
      return 3
  }
}
function operandsNumOf (operator) {
  switch (operator) {
    case '%':
      return [1]
    case '+':
    case '-':
      return [2, 1]
    case '×':
    case '÷':
      return [2]
  }
}
function str2expr (str) {
  const illegal = /[^\s\d\.\+\-×÷%\(\)]+|([×÷%]\s*){2,}|([\+\-]\s*){3,}|\.\s*[\.\+\-×÷%\(\)]|[\+\-×÷\(\)]\s*%/
  const operRe = /[\+\-×÷%\(\)]|\d+\.?\d*|\.\d+/g
  const opers = str.match(operRe)
  if (illegal.test(str)) {
    throw `"${str}" is not a valid expression`
  }
  let isParentheseOpen = 0
  opers.forEach(oper => {
    if (oper === '(') {
      isParentheseOpen++
    } else if (oper === ')') {
      isParentheseOpen--
    }
    if (isParentheseOpen < 0) {
      throw `"${str}" is not a valid expression`
    }
  })
  if (isParentheseOpen) {
    throw `"${str}" is not a valid expression`
  }
  return arr2expr(str.match(operRe))
}
function arr2expr (opers) {
  // Remove outer parenthese
  outer:
  while (opers[0] === '(' && opers[opers.length - 1] === ')') {
    let isParentheseOpen = 0
    for (let i = 1; i < opers.length - 1; i++) {
      if (opers[i] === '(') {
        isParentheseOpen++
      } else if (opers[i] === ')') {
        isParentheseOpen--
      }
      if (isParentheseOpen < 0) {
        break outer
      }
    }
    opers.shift()
    opers.pop()
  }
  if (opers.length === 1) {
    return new Expression('', parseFloat(opers[0]))
  }
  let left = opers
  let right = []
  let isParentheseOpen = 0
  let item = ''
  while (item = left.pop()) {
    switch (item) {
      case ')':
        isParentheseOpen++
        break
      case '(':
        isParentheseOpen--
        break
      case '+':
      case '-':
        if (isParentheseOpen || operandsNumOf(left[left.length - 1]) === 2) {
          right.unshift(item)
        } else {
          return new Expression(item,
            left.length > 1 ? arr2expr(left) : parseFloat(left[0]),
            right.length > 1 ? arr2expr(right) : parseFloat(right[0]))
        }
        break
      default:
        right.unshift(item)
    }
  }
  [left, right] = [right, left]
  isParentheseOpen = 0
  while (item = left.pop()) {
    switch (item) {
      case ')':
        isParentheseOpen++
        break
      case '(':
        isParentheseOpen--
        break
      case '×':
      case '÷':
        if (isParentheseOpen) {
          right.unshift(item)
        } else {
          return new Expression(item,
            left.length > 1 ? arr2expr(left) : parseFloat(left[0]),
            right.length > 1 ? arr2expr(right) : parseFloat(right[0]))
        }
        break
      default:
        right.unshift(item)
    }
  }
  let first = right[0]
  let last = right[right.length - 1]
  if (first === '+' || first === '-') {
    return new Expression(right.shift(),
      right.length > 1 ? arr2expr(right) : parseFloat(right[0]))
  }
  if (last === '%') {
    return new Expression(right.pop(),
      right.length > 1 ? arr2expr(right) : parseFloat(right[0]))
  }
}

function fixFloatCalc (o, a, b) {
  const aa = String(a).split('.')
  const bb = String(b).split('.')
  if (aa[1] || bb[1]) {
    const al = aa[1] ? aa[1].length : 0
    const bl = bb[1] ? bb[1].length : 0
    const m = Math.pow(10, Math.max(al, bl))
    switch (o) {
      case '+':
        return (a * m + b * m) / m
      case '-':
        return (a * m - b * m) / m
      case '×':
        return (a * m) * (b * m) / (m * m)
      case '÷':
        return (a * m) / (b * m)
    }
  } else {
    switch (o) {
      case '+':
        return a + b
      case '-':
        return a - b
      case '×':
        return a * b
      case '÷':
        return a / b
    }
  }
}

Expression.parseString = str2expr

export default Expression
