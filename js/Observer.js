class Observer {
    constructor(data) {
       this.data = data;
       this.walk(data);
    }

    walk(data) {
        var self = this;
        Object.keys(data).forEach(function(key) {
            self.defineReactive(data, key, data[key]);
        });
    }

    defineReactive(obj, key, val) {
        var dep = new Dep();
        
        var childObj = observe(val);// 监听对象子属性
        //添加响应式
        Object.defineProperty(obj, key, {
            enumerable: true,
            configurable: true,
            get: function() {
                if(Dep.target) {
                    dep.addDep(Dep.target);
                }
                return val;
            },
            set: function(newVal) {
                if(val === newVal){
                    return;
                }
                val = newVal;
                console.log(`${key}的值发生了改变，新值为${newVal}`);
                dep.notify();
            }
        })
        
    }
    
}

class Dep {
    constructor() {
        this.deps = [];
        
    }

    addDep(dep) {
        this.deps.push(dep);
    }

    notify() {
        this.deps.forEach(dep => {dep.update()});
    }

    static target = null;
}

function observe(value) {
    if (!value || typeof value !== 'object') {
        return;
    }
    return new Observer(value);
};