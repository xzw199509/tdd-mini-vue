// document.querySelector('#app').innerHTML = `hello tdd-vue`
import { effect, proxyData } from './core/effect.js'

const data = { ok: true, text: 'hello world' }
const obj = proxyData(data)

effect(() => {
  document.body.innerText = obj.ok ? obj.text : 'not'
  console.log('effect run');
})
setTimeout(() => {
  obj.text = 'hello vue'
})
setTimeout(() => {
  obj.ok = false
},1400)