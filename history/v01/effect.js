const bucket = new Set()
// target => key => effectFn
let activeEffect = null

export function proxyData(data) {
  return new Proxy(data, {
    get(target, key) {
      bucket.add(activeEffect)
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      bucket.forEach((fn) => fn())
      return true // return true 用于set调用必须返回布尔值
    },
  })
}

export function effect(fn) {
  activeEffect = fn
  fn()
}

const data = { text: 'hello world' }
let obj = proxyData(data)
effect(() => {
  document.body.innerText = obj.text
  console.log('effect run', obj.text) // 会打印 2 次
})
setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)
