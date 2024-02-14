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
    it('返回函数，自己执行能拿到结果', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const sumRes = computed(() => obj.foo + obj.bar)
      expect(sumRes.value).toBe(3)
    })
    it('处理每次调用都会重新计算', () => {
      const data = { foo: 1, bar: 2 }
      const obj = proxyData(data)
      const logSpy = vi.spyOn(console, 'log')
      const sumRes = computed(() =>{
        console.log('computed run')
        return obj.foo + obj.bar
      })
      expect(sumRes.value).toBe(3)
      // 
      expect(logSpy).toHaveBeenCalledTimes(1)
      sumRes.value
      expect(logSpy).toHaveBeenCalledTimes(1)
    })
  })
  
})
