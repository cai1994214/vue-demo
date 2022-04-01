class Watcher {
    constructor(vm, key, callback) {
        this.vm = vm;
        this.key = key;
        this.callback = callback;
        this.value = this.get();//先获取一遍值
    }

    update() {
        this.run();
    }

    run() {
        var value = this.get();
        var oldValue = this.value;
        if(value !== oldValue) {
            this.value = value;
            this.callback.call(this.vm, value, oldValue);
        }
    }

    get() {
        Dep.target = this;//缓存自己
        var value = this.vm[this.key]; //执行监听器里的get函数
        Dep.target = null;
        return value;
    }
}