const bus = new Vue()

function isNumber (str) {
  return typeof str === 'string' && /^-?(\d+\.?\d*|\.\d+)$/.test(str)
}

function fixFloatCalculation (o, a, b) {
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

function compute (arr) {
  arr = [].concat(arr)
  if (arr.length <= 1) {
    if (!isNumber(arr[0])) {
      console.log('Illegal formula')
    }
    return +arr[0]
  }
  if (arr[0] === '(' && arr[arr.length - 1] === ')') {
    return compute(arr.slice(1, -1))
  }
  let right = arr
  let left = []
  let parentheseDiff = 0
  let item = ''
  while (item = right.shift()) {
    switch (item) {
      case '%':
        left.push('/')
        left.push('100')
        break
      case '(':
        parentheseDiff++
        left.push(item)
        break
      case ')':
        parentheseDiff--
        left.push(item)
        break
      case '+':
        if (parentheseDiff) {
          left.push('+')
          break
        }
        return fixFloatCalculation('+', compute(left), compute(right))
      case '-':
        if (parentheseDiff) {
          left.push('-')
          break
        }
        return fixFloatCalculation('-', compute(left), compute(right))
      default:
        left.push(item)
    }
  }
  parentheseDiff = 0
  while (item = left.pop()) {
    switch (item) {
      case ')':
        parentheseDiff++
        right.unshift(item)
        break
      case '(':
        parentheseDiff--
        right.unshift(item)
        break
      case '×':
        if (parentheseDiff) {
          right.unshift('×')
          break
        }
        return fixFloatCalculation('×', compute(left), compute(right))
      case '÷':
        if (parentheseDiff) {
          right.unshift('÷')
          break
        }
        return fixFloatCalculation('÷', compute(left), compute(right))
      default:
        right.unshift(item)
    }
  }
  console.log('Illegal formula')
}

Vue.component('display', {
  template: '#display-template',
  data () {
    return {
      items: [],
      answer: 0
    }
  },
  computed: {
    expression () {
      return this.items.join(' ')
    },
    parentheseDiff () {
      return this.items.reduce((acc, val) => {
        if (val === '(') {
          return acc + 1
        } else if (val === ')') {
          return acc - 1
        } else {
          return acc
        }
      }, 0)
    }
  },
  mounted () {
    bus.$on('input', val => {
      let items = this.items
      let lastItem = items[items.length - 1]
      if (lastItem === '=') {
        items.length = 0
        lastItem = null
      }
      switch (val) {
        case 'C':
          this.cleanAll()
          return
        case '=':
          this.computeAnswer()
          return
        case '+/-':
          if (!lastItem) {
            items.push(this.answer >= 0 ? '-' + this.answer : -this.answer + '')
            return
          }
          items.pop()
          if (isNumber(lastItem) && lastItem[0] === '-') {
            items.push(lastItem.slice(1))
          } else {
            items.push('-' + lastItem)
          }
          return
        case '.':
          if (isNumber(lastItem) && !lastItem.includes('.')) {
            items.pop()
            items.push(lastItem + '.')
          } else {
            items.push('.')
          }
          return
        case '+':
        case '-':
        case '×':
        case '÷':
          if (!lastItem) {
            items.push(this.answer + '')
          } else if (['+', '-', '×', '÷', '%'].includes(lastItem)) {
            items.pop()
          }
          items.push(val)
          return
        case ')':
          if (this.parentheseDiff) {
            items.push(val)
          }
          return
        default:
          if ((lastItem === '.' || isNumber(lastItem)) && isNumber(val)) {
            if (lastItem === '0' && val === '0') {
              return
            }
            items.pop()
            items.push(lastItem + val)
          } else {
            items.push(val)
          }
      }
    })
  },
  methods: {
    cleanAll () {
      this.items = []
      this.answer = 0
    },
    computeAnswer () {
      if (!this.items.length) {
        return
      }
      try {
        // this.answer = eval(this.expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/%/g, '/100'))
        this.answer = compute(this.items)
      } catch (e) {
        this.answer = 'Error'
        console.log(e)
      }
      this.items.push('=')
    },
    clearEnter () {
      lastItem = this.items.pop()
      if (lastItem && lastItem.length > 1) {
        this.items.push(lastItem.slice(0, -1))
      }
    }
  }
})

Vue.component('panel', {
  template: '#panel-template',
  data () {
    return {
      showMore: false,
      buttons: [
        ['C', '+/-', '%', '÷'],
        ['7', '8', '9', '+'],
        [{main: '4', more: '('}, '5', '6', '-'],
        [{main: '1', more: ')'}, '2', '3', '×'],
        [{main: '...', more: 'v'}, '0', '.', '=']
      ]
    }
  },
  methods: {
    getButtonContent (item) {
      return this.showMore && item.more ? item.more : item.main || item
    },
    buttonAction (e) {
      const val = e.currentTarget.value
      switch (val) {
        case '...':
          this.showMore = true
          break
        case 'v':
          this.showMore = false
          break
        default:
          bus.$emit('input', val)
      }
    }
  }
})

new Vue({
  el: '#calculator'
})