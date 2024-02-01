import { describe, it, vi, expect } from 'vitest'
import { effect, proxyData } from './core/effect.js'

describe('effect', () => {
  it('happy path', () => {
    const logSpy = vi.spyOn(console, 'log')
    effect(() => {
      console.log('effect run')
    })
    expect(logSpy).toHaveBeenCalledTimes(1)
  })
  it('should effect data has been assigned a new value', () => {
    const logSpy = vi.spyOn(console, 'log')
    const data = { age: 1 }
    let obj = proxyData(data)
    effect(() => {
      console.log('effect run', obj.age) // 会打印 2 次
    })
    expect(logSpy).toHaveBeenCalledTimes(1)
    obj.age = 2
    expect(logSpy).toHaveBeenCalledTimes(2)
    expect(data.age).toBe(2)
  })
  it('should two effect functions read the same value', () => {
    const data = { text: 'hello world' }
    const obj = proxyData(data)
    let num1 = 0
    let num2 = 0
    effect(() => {
      obj.text
      num1++
    })
    effect(() => {
      obj.text
      num2++
    })
    obj.text = 'hello tdd'
    expect(data.text).toBe('hello tdd')
    expect(num1).toBe(2)
    expect(num2).toBe(2)
  })
  it('should one effect function read two values', () => {
    const data = { text1: 'hello world', text2: 'hello vue3' }
    const obj = proxyData(data)
    let num1 = 0
    effect(() => {
      num1++
      obj.text1
      obj.text2
    })
    expect(num1).toBe(1)
    obj.text1 = 'hello tdd'
    expect(num1).toBe(2)
    obj.text2 = 'hello tdd'
    expect(num1).toBe(3)
    // 会触发三次
  })
  it('should different effect functions read different values', () => {
    const data = { text1: 'hello world', text2: 'hello vue3' }
    const obj = proxyData(data)
    let num1 = 0
    let num2 = 0
    effect(() => {
      obj.text1
      num1++
      console.log('effectFn1 run')
    })
    effect(() => {
      obj.text2
      num2++
      console.log('effectFn2 run')
    })
    expect(num1).toBe(1)
    expect(num2).toBe(1)
    obj.text1 = 'hello tdd1'
    expect(num1).toBe(2)
    obj.text2 = 'hello tdd2'
    expect(num2).toBe(2)
  })
  it('分支切换', () => {
    const data = { ok: false, text: 'hello world' }
    const obj = proxyData(data)
    let tip = ''
    const logSpy = vi.spyOn(console, 'log')
    effect(() => {
      tip = obj.ok ? obj.text : 'not'
      console.log('effect run')
    })
    obj.text = 'hello vue3'
    expect(logSpy).toHaveBeenCalledTimes(1)
    obj.ok = true
    expect(logSpy).toHaveBeenCalledTimes(2)
  })
  it('effect 嵌套 赋值foo', () => {
    const data = { foo: true, bar: true }
    const obj = proxyData(data)
    let temp1
    let temp2
    const logSpy = vi.spyOn(console, 'log')
    effect(() => {
      console.log('effectFn1 run')
      effect(() => {
        console.log('effectFn2 run')
        temp2 = obj.bar
      })
      temp1 = obj.foo
    })
    obj.foo = false
    expect(logSpy).toHaveBeenCalledTimes(4)
  })
  it('effect 嵌套 赋值嵌套中的属性bar', () => {
    const data = { foo: true, bar: true }
    const obj = proxyData(data)
    let temp1
    let temp2
    const logSpy = vi.spyOn(console, 'log')
    effect(() => {
      console.log('effectFn1 run')
      effect(() => {
        console.log('effectFn2 run')
        temp2 = obj.bar
      })
      temp1 = obj.foo
    })
    obj.bar = false
    expect(logSpy).toHaveBeenCalledTimes(3)
  })
})
