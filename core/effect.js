const bucket = new Set()
let activeEffect = null;

export function proxyData(data) {
    return new Proxy(data, {
        get(target, key) {
            if (activeEffect) {
                // 存储副作用函数到桶中
                bucket.add(activeEffect)
            }
            return target[key]
        },
        set(target, key, newVal) {
            target[key] = newVal
            bucket.forEach(fn => fn())
            return true
        }
    })
}

export function effect(fn) {
    // 将副作用函数赋值给全局变量，并调用
    activeEffect = fn;
    fn();
}



