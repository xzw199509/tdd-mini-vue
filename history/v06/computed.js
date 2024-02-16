import { effect, trigger, track, proxyData } from './effect.js'
export function computed(getter) {
  // value 用来缓存上一次计算的值，
  let value
  // dirty 标志，用来标记是否需要重新计算，true 为脏需要重新计算
  let dirty = true
  // 把 getter 作为副作用函数，创建一个 lazy 的 effect
  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      if (!dirty) {
        dirty = true
        // 当计算属性依赖的响应式数据变化时，手动调用 trigger 函数响应
        trigger(obj, 'value')
      }
    },
  })
  const obj = {
    get value() {
      if (dirty) {
        value = effectFn()
        dirty = false
      }
      // 当读取 value 时，手动调用 track 函数进行追踪
      track(obj, 'value')
      return value
    },
  }
  return obj
}

const data = { foo: 1, bar: 2 }
const obj = proxyData(data)
const sumRes = computed(() => {
  return obj.foo + obj.bar
})
console.log('sumRes   ' + sumRes.value)
obj.foo++
console.log('sumRes   ' + sumRes.value)
