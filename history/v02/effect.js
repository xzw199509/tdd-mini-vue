const bucket = new WeakMap()
// target => key => effectFn
let activeEffect = null

export function proxyData(data) {
  return new Proxy(data, {
    get(target, key) {
      track(target, key)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      trigger(target, key)
      return true // return true 用于set调用必须返回布尔值
    },
  })
}

function track(target, key) {
  if (!activeEffect) return
  let depsMap = bucket.get(target)
  if (!depsMap) {
    bucket.set(target, (depsMap = new Map()))
  }
  let deps = depsMap.get(key)
  if (!deps) {
    depsMap.set(key, (deps = new Set())) // key 就不能重复
  }
  // 最后将激活的副作用函数添加到桶中
  deps.add(activeEffect)
}
function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return true // return true 用于set调用必须返回布尔值
  const effects = depsMap.get(key)
  effects && effects.forEach((fn) => fn())
}

export function effect(fn) {
  activeEffect = fn
  fn()
}

// const data = { text: 'hello world' }
// let obj = proxyData(data)
// effect(() => {
//   document.body.innerText = obj.text
//   console.log('effect run', obj.text) // 会打印 2 次
// })
// setTimeout(() => {
//   obj.text = 'hello vue3'
// }, 1000)

const data = { ok: false, text: 'hello world' }
const obj = proxyData(data)

effect(() => {
  document.body.innerText = obj.ok ? obj.text : 'not'
  console.log('effect run', obj.text) // 会打印 2 次
})
setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)
