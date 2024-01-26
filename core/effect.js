const bucket = new WeakMap()
// target => key => effectFn
let activeEffect = null

export function proxyData(data) {
  return new Proxy(data, {
    get(target, key) {
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
      return target[key]
    },
    set(target, key, newVal) {
      target[key] = newVal
      const depsMap = bucket.get(target)
      if (!depsMap) return true // return true 用于set调用必须返回布尔值
      const effects = depsMap.get(key)
      effects && effects.forEach((fn) => fn())
      return true // return true 用于set调用必须返回布尔值
      
    },
  })
}

export function effect(fn) {
  // 将副作用函数赋值给全局变量，并调用
  activeEffect = fn
  fn()
}
