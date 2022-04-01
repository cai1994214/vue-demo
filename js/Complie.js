class Compile {
    constructor(el, vm) {
        this.vm = vm;
        this.el = document.querySelector(el);
        this.fragment = null;
        this.init();
    }

    init() {//初始化判断dom 存在
        if(this.el) {
            //先创建一个dom片段 然后将el节点插入到dom片段中 全部在片段进行解析操作 最后在插入到el节点中
            this.fragment = this.node2fragment(this.el); 
            this.compileElement(this.fragment);
            this.el.appendChild(this.fragment);
            // 性能不好
            // this.compileElement(this.el);
        }else{
            console.log('Dom 不存在')
        }
    }

    node2fragment(el) {
        var fragment = document.createDocumentFragment();
        var child;
        while(child = el.firstChild) {
            fragment.appendChild(child);
        }
        return fragment;
    }

    compileElement(el) {//解析dom
        var childNodes = el.childNodes;
        [].slice.call(childNodes).forEach(node => {
            var reg = /\{\{(.*)\}\}/;
            var text = node.textContent;

            if(this.isElementNode(node)) { //元素节点
                this.compile(node); //递归解析
            }else if(this.isTextNode(node) && reg.test(text)) { //文本节点
                this.compileText(node, text.match(reg)[1]);
            }

            if(node.childNodes && node.childNodes.length) {
                this.compileElement(node);
            }
        })
    }

    compile(node) {
        var nodeAttrs = node.attributes;
        [].slice.call(nodeAttrs).forEach(attr => {
            var attrName = attr.name;
            if(this.isDirective(attrName)) {//vue v- 绑定的指令
                var dir = attrName.substring(2); //获取事件指令
                var expr = attr.value; //获取事件表达式 绑定的值 或者函数
                if(this.isEventDirective(dir)) {//事件指令
                    this.compileEvent(node, this.vm, dir, expr);
                }else{// v-model 指令
                    this.compileModel(node, this.vm, dir, expr);
                }
                node.removeAttribute(attrName);
            }
        })
    }

    compileText(node, expr) {//解析文本
        var self = this;
        var initText = this.vm[expr]; //解析花括号内容 获取vue data[exper]的值
        this.updateText(node, initText); //将node文本内容修改成 vue data里的内容 没有则为空
        new Watcher(this.vm, expr, function(value) {
            self.updateText(node, value);
        })
    }
    
    compileEvent(node, vm, dir, expr) {//node:文本 vm:vue实例 dir:指令 expr:函数 或者 绑定的值
        var eventType = dir.split(':')[1];
        var cb = vm.methods && vm.methods[expr];
        if(eventType && cb) {
            node.addEventListener(eventType, cb.bind(vm), false)
        }

    }

    compileModel(node, vm, dir, expr) {//解析v-model 双向绑定
        var self = this;
        var val = this.vm[expr];
        this.modelUpdater(node, val);
        new Watcher(this.vm, expr, function(value) {
            self.modelUpdater(node, value);
        })

        node.addEventListener('input', function(e){
            var newValue = e.target.value;
            if(val === newValue){
                return;
            }
            self.vm[expr] = newValue;
            val = newValue;
        })

    }

    modelUpdater(node, value) {
        node.value = typeof value == 'undefined' ? '' : value;
    }

    updateText(node, value) {//
        node.textContent = typeof value == 'undefined' ? '' : value
    }

    isDirective(attrName) {// vue指令
        return attrName.includes('v-');
    }

    isEventDirective(dir) {// vue事件 on:
        return dir.includes('on:')
    }

    isElementNode(node) {
        return node.nodeType === 1;//1是元素节点
    }

    isTextNode(node) {
        return node.nodeType === 3;//3是文本节点
    }
}