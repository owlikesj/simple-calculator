import Expression from '../js/expression'

export function testAdd (test) {
  test.expect(2)
  let e1 = new Expression('+', 1, 2)
  test.equal(e1.getResult(), 3, '1加2应该等于3')
  let e2 = new Expression('+', e1, 3)
  test.equal(e2.getResult(), 6, `表达式${JSON.stringify(e1)}加3应该等于6`)
  test.done()
}

export function testOne (test) {
  test.expect(2)
  let e1 = new Expression('-', 5)
  test.equal(e1.getResult(), -5, '-5应该等于-5')
  let e2 = new Expression('%', 5)
  test.equal(e2.getResult(), 0.05, '5%应该等于0.05')
  test.done()
}

export function testParse (test) {
  test.expect(3)
  let str = '1 + 2'
  let e = new Expression('+', 1, 2)
  test.deepEqual(Expression.parseString(str), e, `${str}应该被解析成表达式对象${JSON.stringify(e)}`)
  let longStr = '1+(5%+3)-.4×5÷6'
  let result = 1 + (5 / 100 + 3) - 0.4 * 5 / 6
  test.equal(Expression.parseString(longStr).getResult(),
    result, `${str}被解析成表达式对象计算结果得到${result}`)
  let str2 = '-1 + 2'
  let e2 = Expression.parseString(str2)
  test.equal(e2.getResult(), 1, '-1+2应该得到1')
  test.done()
}

export function testFloat (test) {
  test.expect(2)
  let str1 = '.1 + 0.2'
  let e1 = Expression.parseString(str1)
  test.equal(e1.getResult(), 0.3, '0.1加0.2应该等于0.3')
  let str2 = '.01 ÷ .2'
  let e2 = Expression.parseString(str2)
  test.equal(e2.getResult(), 0.05, '0.1除以0.2应该等于0.05')
  test.done()
}

export function testParenthese (test) {
  test.expect(1)
  let str = '2 + (2 + 3) × 2'
  let e = Expression.parseString(str)
  test.equal(e.getResult(), 12, '2+(2+3)×2应该等于12')
  test.done()
}
