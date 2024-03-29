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
  activeEffect.deps.push(deps)
}

function trigger(target, key) {
  const depsMap = bucket.get(target)
  if (!depsMap) return true // return true 用于set调用必须返回布尔值
  const effects = depsMap.get(key)
  // effects && effects.forEach((fn) => fn())
  const effectsToRun = new Set(effects)
  effectsToRun.forEach((effectFn) => effectFn())
}

export function effect(fn) {
  const effectFn = () => {
    // cleanup 完成清除工作
    cleanup(effectFn)
    // 将副作用函数赋值给全局变量，并调用
    activeEffect = effectFn
    fn()
  }
  // activeEffect.deps 用来储存所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  effectFn()
}

function cleanup(effectFn) {
  // 遍历 effectFn.deps 数组
  for (let i = 0; i < effectFn.deps.length; i++) {
    // deps 是依赖集合
    const deps = effectFn.deps[i]
    // 将 effectFn 从依赖集合中移除
    deps.delete(effectFn)
  }

  effectFn.deps.length = 0
}

const data = { ok: false, text: 'hello world' }
const obj = proxyData(data)

effect(() => {
  document.body.innerText = obj.ok ? obj.text : 'not'
  console.log('effect run') // 会打印 2 次
})
setTimeout(() => {
  obj.text = 'hello vue3'
}, 1000)
