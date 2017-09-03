Vue.component('display', {
  template: '#display-template',
  data () {
    return {
      expression: '2900 × 3 - 197.5',
      answer: 1337
    }
  }
})

Vue.component('panel', {
  template: '#panel-template',
  data () {
    return {
      inputs: [
        ['C', '+/-', '%', '÷'],
        ['7', '8', '9', '+'],
        ['4', '5', '6', '-'],
        ['1', '2', '3', '×'],
        ['...', '0', '.', '=']
      ]
    }
  }
})

new Vue({
  el: '#calculator'
})