const bucket = new WeakMap()
// target => key => effectFn

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
  if (!effects) return true
  const effectsToRun = new Set()
  effects.forEach((effectFn) => {
    // 判断当前 trigger 触发得副作用函数与证再执行得副作用函数是否相同
    if (effectFn !== activeEffect) {
      effectsToRun.add(effectFn)
    }
  })
  effectsToRun.forEach((effectFn) => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}

let activeEffect = null
// effect 栈
const effectStack = []
export function effect(fn, options = {}) {
  const effectFn = () => {
    // cleanup 完成清除工作
    cleanup(effectFn)
    // 将副作用函数赋值给全局变量，并调用
    activeEffect = effectFn
    // 在调用副作用函数之前将当前副作用函数压入栈中
    effectStack.push(effectFn)
    const res = fn()
    // 当副作用函数执行完毕后，将当前副作用函数弹出，并还原
    effectStack.pop()
    activeEffect = effectStack[effectStack.length - 1]
    // res 做为 effectFn 的返回值
    return res
  }
  // 把options 挂载到effectFn 上
  effectFn.options = options
  // activeEffect.deps 用来储存所有与该副作用函数相关的依赖集合
  effectFn.deps = []
  if (!options.lazy) {
    effectFn()
  }
  return effectFn
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

// 定义一个任务队列
export const jobQueue = new Set()
// 使用promise.resolve() 把任务丢到微任务队列中
const p = Promise.resolve()

let isFlushing = false
export function flushJob() {
  // 如果队列再刷新，则不处理
  if (isFlushing) return
  isFlushing = true
  p.then(() => {
    jobQueue.forEach((job) => job())
  }).finally(() => {
    // 结束后重置 isFlushing
    isFlushing = false
  })
}
export function computed(getter) {
  // value 用来缓存上一次计算的值，
  let value
  // dirty 标志，用来标记是否需要重新计算，true 为脏需要重新计算
  let dirty = true
  // 把 getter 作为副作用函数，创建一个 lazy 的 effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      dirty = true
    },
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      return value
    },
  }
  return obj
}
