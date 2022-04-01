class MVue {
    constructor(options) {
        console.log(options, 'options');
        this.$options = options;//缓存传过来的对象

        //数据响应化
        this.$data = options.data;
        this.methods = options.methods;

        Object.keys(this.$data).forEach(key => {
            this.proxyKeys(key);
        })
        observe(this.$data);//监听数据
        new Compile(options.$el, this);
        Promise.resolve().then(() => {
            options.mounted.call(this);
        })
       
    }

    proxyKeys(key){//通过this.value 直接获取this.data.value
        Object.defineProperty(this, key, {
            enumerable: false,//不可枚举
            configurable: true,//可配置
            get: function () {
                return this.$data[key];
            },
            set: function (nVal) {
                this.$data[key] = nVal;
            }
        })
    }
   
}




