import { describe, it, vi, expect } from 'vitest';
import { effect, proxyData } from './core/effect';

describe('effect', () => {
    it('happy path', () => {
        const logSpy = vi.spyOn(console, 'log');
        effect(() => {
            console.log('effect run');
        })
        expect(logSpy).toHaveBeenCalledTimes(1)
    })
    it('should effect data has been assigned a new value', () => {
        const logSpy = vi.spyOn(console, 'log');
        const data = { age: 1 }
        const obj = proxyData(data)
        effect(() => {
            console.log('effect run', obj.age) // 会打印 2 次
        })
        obj.age = 2
        expect(logSpy).toHaveBeenCalledTimes(2)
        expect(data.age).toBe(2)
    })
})