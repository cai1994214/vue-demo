/**
* obj: 
* imgArr 图片数组
* imgWidth 图片宽度
* aniTime 动画切换时间
* intervalTime 停留的时间
* scale 图片缩放
* autoplay 是否自动播放
* gap 图片之间间隔
*/
class Swiper{
    constructor(obj){
        this.imgArr = obj.imgArr || [];
        this.scale = obj.scale || 0.8; // 图片缩放值
        this.gap = obj.gap; // 图片未缩放状态下图片之间的间隔
        // 移动端
        if ((navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))) {
            this.containerWidth = document.body.clientWidth; // 轮播图盒子宽度
        }else{
            // PC端
            this.containerWidth = 600; // 轮播图盒子宽度
        }
        this.imgWidth = obj.imgWidth; // 图片宽度
        this.aniTime = obj.aniTime || 500;
        this.intervalTime = this.aniTime + obj.intervalTime || 2000;
        this.nowIndex = 3;
        this.imgDoms = document.getElementsByClassName('swiper-slide');
        this.mainDom = document.getElementsByClassName('swiper-main')[0];
        this.listDoms = document.getElementsByClassName('swiper-list')[0];
        this.activeDom = this.imgDoms[0];
        this.autoplay = obj.autoplay;
    
        this.listDoms.style.width = `${this.containerWidth}px`;
    
        this.timer; // 自动播放的定时器
        this.prev = Date.now();
    
        this.diffLen = (this.containerWidth - this.imgWidth - (this.gap * 2)) / 2;
        this.clsSuffix = obj.clsSuffix; // 类名后缀
    }

    // 上一张
    prevSlider(aniTIme) {
        let that = this;
        if (this.imgArr.length===1) return;
        this.mainDom.style.transition = `left ${aniTIme / 1000}s`
        this.mainDom.style.left = `${parseInt(this.mainDom.style.left) + this.moveWidth}px`; // 图片列表div的left值变化
        if (this.nowIndex === 0) {
            that.nowIndex = (that.imgArr.length-1);
            that.setActiveSpot();
            setTimeout(function() {                    
                that.mainDom.style.transitionProperty = 'none'; // 悄悄换left值时，要设置这个属性，不然会播放动画
                that.mainDom.style.left = `${-that.imgArr.length * that.moveWidth}px`;
            }, aniTIme) // 当前展示第一张，上一张再没有了，悄悄把图片列表页left值变化，展示的图片还是第一张图片
        } else {
            this.nowIndex--;
            this.setActiveSpot();
        }
    }

    // 下一张
    nextSlider(aniTIme) {
        let that = this;
        if (this.imgArr.length===1) return;
        this.nowIndex++;
        this.mainDom.style.transition = `left ${aniTIme / 1000}s`
        this.mainDom.style.left = `${parseInt(this.mainDom.style.left) - this.moveWidth}px`;
        if (this.nowIndex === (this.imgArr.length)) {
            that.nowIndex = 0;
            that.setActiveSpot();
            setTimeout(function() {
                that.mainDom.style.transitionProperty = 'none';
                that.mainDom.style.left = `${-that.moveWidth}px`;
            }, aniTIme) // 当前展示最后一张，下一张再没有了，悄悄把图片列表div的left值变化，展示的图片还是最后一张图片
        } else {
            this.setActiveSpot();
        }
    }

    // 设置原点样式
    setActiveSpot(){
        for (let i = 0; i < this.swiperSpotDom.childElementCount; i++) {                
            if (i === Math.abs(this.nowIndex)) {
                document.getElementsByClassName('spot-item')[i].style.backgroundColor = '#ff5c1f'
            } else {
                document.getElementsByClassName('spot-item')[i].style.backgroundColor = '#ccc'
            }
        }
    }

    // 节流：时间戳版
    throttle(handle, delay, val) {
        var now = Date.now();
        if (now - this.prev >= delay) {
            handle.call(this, val);
            this.prev = Date.now();
        }
    }

    eventBind() {
        // 下一张按钮事件绑定
        this.rightBtn.addEventListener('mouseover', function() {
            clearInterval(that.timer);
        })
        this.rightBtn.addEventListener('mouseout', function() {
            that.timer = setInterval(that.nextSlider.bind(that, that.aniTIme), that.intervalTime);
        })
        this.rightBtn.addEventListener('click', function() {
            that.throttle(that.nextSlider, 300, 300);
        })

        // 小圆点事件绑定
        this.swiperSpotDom.addEventListener('mouseover', function() {
            clearInterval(that.timer);
        })
        this.swiperSpotDom.addEventListener('mouseout', function() {
            that.timer = setInterval(that.nextSlider.bind(that, that.aniTIme), that.intervalTime);
        })
        this.swiperSpotDom.addEventListener('click', function(e) {
            e = e || window.event; //这一行及下一行是为兼容IE8及以下版本
        　　var target = e.target || e.srcElement;
        　　if (target.tagName.toLowerCase() === "li") {
    　　　　    var ret = this.querySelectorAll("li");
    　　　　    let index = Array.prototype.indexOf.call(ret, target);
                that.nowIndex = index;
                that.setActiveSpot();
                that.mainDom.style.transition = `left .8s`
                that.mainDom.style.left = `${-(that.nowIndex+1) * that.moveWidth}px`;
        　　}
        })

        this.mainDom.addEventListener('touchstart', function(e) {
            clearInterval(that.timer);
            that.startX = e.changedTouches[0].clientX;
            that.startY = e.changedTouches[0].clientY;
        })
        this.mainDom.addEventListener('touchmove', function(e) {
            clearInterval(that.timer);
            that.endX = e.changedTouches[0].clientX;
            that.endY = e.changedTouches[0].clientY;
        })
        this.mainDom.addEventListener('touchend', function(e) {
            if (!that.mainDom.style.transition) {
                that.mainDom.style.transition = `left ${that.aniTIme / 1000}s`
            }
            let angle = that.angle({ X: that.startX, Y: that.startY }, { X: that.endX, Y: that.endY });
            if (Math.abs(angle) > 30) return;
            if (that.endX > that.startX){ // 右滑
                that.prevSlider();
            } else { // 左滑
                that.nextSlider();
            }
            that.timer = setInterval(that.nextSlider.bind(that, that.aniTIme), that.intervalTime);
            
        })
    }
    /**
    * 计算滑动角度
    * @param {Object} start 起点坐标
    * @param {Object} end 终点坐标
    */
    angle(start, end) {
        let _X = end.X - start.X;
        let _Y = end.Y - start.Y;
        //返回角度 /Math.atan()返回数字的反正切值
        return 360 * Math.atan(_Y / _X) / (2 * Math.PI);
    }
}

