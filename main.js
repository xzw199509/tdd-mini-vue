// document.querySelector('#app').innerHTML = `hello tdd-vue`
import { effect, proxyData, jobQueue, flushJob } from './core/effect.js'
// const data = { ok: true, text: 'hello world' }
// const obj = proxyData(data)

// effect(() => {
//   document.body.innerText = obj.ok ? obj.text : 'not'
//   console.log('effect run');
// })
// setTimeout(() => {
//   obj.text = 'hello vue'
// })
// setTimeout(() => {
//   obj.ok = false
// },1400)


// const data = { foo: 1 }
// const obj = proxyData(data)
// const scheduler = (fn) => {
//   setTimeout(fn);
// }
// effect(
//   () => {
//     console.log(obj.foo)
//   },
//   {
//     scheduler,
//   }
// )
// obj.foo++
// console.log('结束')

const data = { foo: 1 }
    const obj = proxyData(data)
const scheduler = (fn) => {
  // setTimeout(fn);
  jobQueue.add(fn)
  flushJob()
}
effect(
  () => {
    console.log(obj.foo)
  },
  {
    scheduler,
  }
)
obj.foo++
obj.foo++