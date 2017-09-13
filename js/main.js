import Vue from 'vue'
import Expression from './expression'
import '../css/main.css'

function isNumber (str) {
  return typeof str === 'string' && /^-?(\d+\.?\d*|\.\d+)$/.test(str)
}

const bus = new Vue()

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
      return this.items.join('')
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
        case '±':
          if (!lastItem) {
            items.push(this.answer >= 0 ? '-' + this.answer : -this.answer + '')
            return
          }
          items.pop()
          if (isNumber(lastItem) && lastItem[0] === '-') {
            items.push(lastItem.slice(1))
          } else if (isNumber(lastItem)) {
            items.push('-' + lastItem)
          } else {
            items.push(lastItem)
          }
          return
        case '%':
          if (!lastItem) {
            items.push(this.answer)
            return
          }
          if (!isNumber(lastItem)) {
            items.pop()
          }
          items.push('%')
          return
        case '.':
          if (isNumber(lastItem) && !lastItem.includes('.')) {
            items.pop()
            items.push(lastItem + '.')
          } else if (lastItem === '%') {
            items.pop()
            items.push('.')
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
          } else if (['+', '-', '×', '÷'].includes(lastItem)) {
            items.pop()
          }
          items.push(val)
          return
        case '(':
          if (lastItem && (isNumber(lastItem) || lastItem === '.' || lastItem === '%')) {
            return
          }
          items.push(val)
          return
        case ')':
          if (this.parentheseDiff) {
            items.push(val)
          }
          return
        default:
          if (lastItem === ')') {
            if (isNumber(val) || val === '.') {

            }
          } else if ((lastItem === '.' || isNumber(lastItem)) && isNumber(val)) {
            if (lastItem === '0') {
              items.pop()
              items.push(val)
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
        this.answer = Expression
          .parseString(this.expression)
          .getResult()
      } catch (e) {
        this.answer = 'Error'
        console.log(e)
      }
      this.items.push('=')
    },
    clearEnter () {
      let lastItem = this.items.pop()
      if (lastItem && lastItem.length > 1) {
        this.items.push(lastItem.slice(0, -1))
      }
    }
  },
  filters: {
    short (answer, length) {
      if (!isFinite(answer) || String(answer).length <= length) {
        return answer
      }
      answer = String(answer.toPrecision(length))
      if (!answer.includes('e')) {
        return answer.substr(0, length)
      }
      let [mantissa, exponent] = String(answer).split('e')
      if (mantissa.length + exponent.length + 1 > length) {
        answer = mantissa.substr(0, length - 1 - exponent.length) + 'e' + exponent
      }
      return answer
    }
  }
})

Vue.component('panel', {
  template: '#panel-template',
  data () {
    return {
      showMore: false,
      buttons: [
        ['C', '±', '%', '÷'],
        ['7', '8', '9', '+'],
        [{main: '4', more: '('}, '5', '6', '-'],
        [{main: '1', more: ')'}, '2', '3', '×'],
        [{main: '...', more: '⏎'}, '0', '.', '=']
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
        case '⏎':
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

// 暴力解决iOS10 Safari不识别viewport禁用缩放
document.documentElement.addEventListener('touchstart', function (event) {
  if (event.touches.length > 1) {
    event.preventDefault()
  }
}, false)
var lastTouchEnd = 0
document.documentElement.addEventListener('touchend', function (event) {
  var now = Date.now()
  if (now - lastTouchEnd <= 300) {
    event.preventDefault()
  }
  lastTouchEnd = now
}, false)
