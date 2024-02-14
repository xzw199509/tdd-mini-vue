import { describe, it, vi, expect } from 'vitest'
import { effect, proxyData, computed } from './core/effect.js'
describe('lazy and computed', () => {
  it('lazy happy path', () => {
    const data = { foo: 1 }
    const obj = proxyData(data)
    const logSpy = vi.spyOn(console, 'log')
    effect(
      () => {
        console.log(obj.foo)
      },
      {
        lazy: true,
      }
    )
    obj.foo++   
    expect(logSpy).toHaveBeenCalledTimes(0)
  })
  describe('computed',()=>{
    // 能拿到计算结果、2 缓存 3 值改变重新计算
    it('返回函数，自己执行能拿到结果', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const sumRes = computed(() => obj.foo + obj.bar)
      expect(sumRes.value).toBe(3)
    })
    it('重复获取value不需要重新计算', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const logSpy = vi.spyOn(console, 'log')
      const sumRes = computed(() =>{
        console.log('computed run')
        return obj.foo + obj.bar
      })
      expect(sumRes.value).toBe(3)
      // 每次读取value 都会执行
      expect(logSpy).toHaveBeenCalledTimes(1)
      sumRes.value
      expect(logSpy).toHaveBeenCalledTimes(1)
    })
    it('值改变是需要重新计算', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const sumRes = computed(() =>{
        return obj.foo + obj.bar
      })
      expect(sumRes.value).toBe(3)
      obj.foo++
      expect(sumRes.value).toBe(4)
    })
    it('effect 嵌套 computed 返回值的情况', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const logSpy = vi.spyOn(console, 'log')
      const sumRes = computed(() => obj.foo + obj.bar)
      effect(()=>{
        console.log(sumRes.value);
      })
      expect(logSpy).toHaveBeenCalledTimes(1)
      obj.foo++
      expect(logSpy).toHaveBeenCalledTimes(2)
    })
  })
  
})
