import BasicExpression from '../js/basic'
import assert from 'assert'

function testAdd () {
  let e1 = new BasicExpression('+', 1, 2)
  assert.equal(e1.getResult(), 3, '1加2应该等于3')
  let e2 = new BasicExpression('+', e1, 3)
  assert.equal(e2.getResult(), 6, `表达式${JSON.stringify(e1)}加3应该等于6`)
}

testAdd()
