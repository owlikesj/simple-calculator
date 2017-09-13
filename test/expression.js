import Expression from '../js/expression'
import assert from 'assert'

function testAdd () {
  let e1 = new Expression('+', 1, 2)
  assert.equal(e1.getResult(), 3, '1加2应该等于3')
  let e2 = new Expression('+', e1, 3)
  assert.equal(e2.getResult(), 6, `表达式${JSON.stringify(e1)}加3应该等于6`)
}

function testOne () {
  let e1 = new Expression('-', 5)
  assert.equal(e1.getResult(), -5, '-5应该等于-5')
  let e2 = new Expression('%', 5)
  assert.equal(e2.getResult(), 0.05, '5%应该等于0.05')
}

function testParse () {
  let str = '1 + 2'
  let e = new Expression('+', 1, 2)
  assert.deepEqual(Expression.parseString(str), e, `${str}应该被解析成表达式对象${JSON.stringify(e)}`)
  let longStr = '1+(5%+3)-.4×5÷6'
  let result = 1 + (5 / 100 + 3) - 0.4 * 5 / 6
  assert.equal(Expression.parseString(longStr).getResult(),
    result, `${str}被解析成表达式对象计算结果得到${result}`)
  let str2 = '-1 + 2'
  let e2 = Expression.parseString(str2)
  assert.equal(e2.getResult(), 1, '-1+2应该得到1')
}

function testFloat () {
  let str1 = '.1 + 0.2'
  let e1 = Expression.parseString(str1)
  assert.equal(e1.getResult(), 0.3, '0.1加0.2应该等于0.3')
  let str2 = '.01 ÷ .2'
  let e2 = Expression.parseString(str2)
  assert.equal(e2.getResult(), 0.05, '0.1除以0.2应该等于0.05')
}

function testParenthese () {
  let str = '2 + (2 + 3) × 2'
  let e = Expression.parseString(str)
  assert.equal(e.getResult(), 12, '2+(2+3)×2应该等于12')
}

testAdd()
testOne()
testParse()
testFloat()
testParenthese()
