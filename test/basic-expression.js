import BasicExpression from '../js/basic-expression'
import assert from 'assert'

function testAdd () {
  let e1 = new BasicExpression('+', 1, 2)
  assert.equal(e1.getResult(), 3, '1加2应该等于3')
  let e2 = new BasicExpression('+', e1, 3)
  assert.equal(e2.getResult(), 6, `表达式${JSON.stringify(e1)}加3应该等于6`)
}

function testOne () {
  let e1 = new BasicExpression('-', 5)
  assert.equal(e1.getResult(), -5, '-5应该等于-5')
  let e2 = new BasicExpression('%', 5)
  assert.equal(e2.getResult(), 0.05, '5%应该等于0.05')
}

function testParse () {
  let str = '1 + 2'
  let e = new BasicExpression('+', 1, 2)
  assert.deepEqual(BasicExpression.parseString(str), e, `${str}应该被解析成表达式对象${JSON.stringify(e)}`)
  let longStr = '1+(5%+3)-.4×5÷6'
  let result = 1 + (5 / 100 + 3) - 0.4 * 5 / 6
  assert.equal(BasicExpression.parseString(longStr).getResult(),
    result, `${str}被解析成表达式对象计算结果得到${result}`)
}

function testFloat () {
  let str = '.1 + 0.2'
  let e = BasicExpression.parseString(str)
  assert.equal(e.getResult(), 0.3, '0.1加0.2应该等于0.3')
}

testAdd()
testOne()
testParse()
testFloat()
