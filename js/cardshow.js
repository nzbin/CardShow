/*
 * cardshow.js v1.0.0
 * 
 * Released under the MIT license
 * Copyright 2016 by nzbin
 */

//jQuery.fn.reverse = [].reverse;

;
(function(window, $) {

    'use strict';

    // 数组随机变换函数
    function shuffleArr(array) {
        var m = array.length,
            t, i;
        // While there remain elements to shuffle…
        while (m) {
            // Pick a remaining element…
            i = Math.floor(Math.random() * m--);
            // And swap it with the current element.
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    };

    // 产生相邻不重复的随机数，n 为随机数个数
    // 定义比较变量，能否封装？
    var b = 0;

    function random(n) {
        var a = Math.floor(Math.random() * n);

        if (a == b) {
            return random(n); // 忘记传参，找了好长时间的错误
        } else {
            b = a;
            return b;
        }

    };

    $.CardShow = function(el, options) {

        this.cardContainer = $(el);
        this.containerWidth = this.cardContainer.width();
        this.containerHeight = this.cardContainer.height();
        // 中奖号
        this.luckyNum = 0;
        // 全局标识符
        this.isDrawing = false;
        // 随机数产生次数
        this.runTimes = 0;
        // 扩展 options
        this.options = $.extend(true, {}, $.CardShow.defaults, options);
        // 卡片尺寸信息
        this.cardWidth = this.options.cardWidth;
        this.cardHeight = this.options.cardHeight;
        // 保存抽卡数
        this.drawingCardsNum = this.options.drawingCardsNum;
        // 初始化插件
        this.init(options);

    }

    $.CardShow.defaults = {
        // 自动抽取或者手动抽取
        autoDrawing: true,
        // 每轮次抽取的数量，默认为一张
        drawingCardsNum: 3,
        // 抽奖轮次，默认值为 0 ，不限次
        drawingRounds: 0,
        // 自动抽取的速度
        drawingSpeed: 300,
        // 用户数过多时，分行显示
        rows: 2,
        // 卡片宽度
        cardWidth: 90,
        // 卡片高度
        cardHeight: 120
    };

    $.CardShow.prototype = {

        init: function(options) {

            // 插入数据
            this.setData();

            this.entrance(this.cards);

            this.turnItem();

            this.initEvents();

        },
        setData: function() {

            // 数组插入模拟数据
            // var cardsArr = [];
            // for (var i = 0; i < 30; i++) {
            //     var str = '<li class="card card-flip">' +
            //         '<figure><img src="img/' + Math.ceil(Math.random() * 12) + '.jpg"/><figcaption>' + i + '</figcaption></figure>' +
            //         '<div class="card-back"></div>' +
            //         '</li>';
            //     cardsArr.push(str);
            // };
            // this.cardContainer.html(cardsArr);
            // this.cards = this.cardContainer.find('li');

            // 拼接字符串插入方法
            this.cardContainer.html('');

            var str = '';

            for (var i = 0; i < 30; i++) {
                str += '<li class="card card-flip">' +
                    '<figure><img src="img/' + Math.ceil(Math.random() * 12) + '.jpg"/><figcaption>' + i + '</figcaption></figure>' +
                    '<div class="card-back"></div>' +
                    '</li>';
            };
            // 获取所有卡片
            this.cards = $(str);
            // 参加抽奖用户总数
            this.totalNum = this.cards.length;

        },
        // 数组重排
        shuffle: function() {
            var self = this;
            shuffleArr(self.cards);
            self.arrange(1.5, 0, 0);
        },

        // 设置用户信息卡片排列位置，
        // x ,y 表示卡片间隔，z 表示初始位置还是排列位置 0 || 1
        arrange: function(x, y, z) {
            var self = this;
            // shuffleArr(this.cards);
            this.cards.css('transition', 'all .3s ease');
            // 计算每行卡片数
            var rowsNum = Math.ceil(self.totalNum / self.options.rows);

            if (!z) {
                // 如果卡片位于初始位置，不对卡片分组
                self.cards
                    .each(function(j) {
                        $(this).css({
                            'transform': 'translate(' + j * x + 'px, ' + y + 'px)',
                            'z-index': j
                        });
                    });

                return;
            }

            // 循环添加每张卡片的位移
            for (var i = 0; i < self.options.rows; i++) {
                // 根据行数进行卡片分组
                self.cards.slice(rowsNum * i, rowsNum * (i + 1))
                    .each(function(j) {
                        $(this).css({
                            'transform': 'translate(' + j * x + 'px, ' + (self.cardHeight * i + y * i) * z + 'px)',
                            //'transition': 'all ' + self.options.drawingSpeed + 'ms '+ 'ease ' + self.options.drawingSpeed*0.5*(rowsNum-j) + 'ms' ,
                            'z-index': j + rowsNum * i
                        });
                    });
            }

        },
        // 卡片入场动画
        entrance: function($elem) {
            var self = this;
            $elem.css('opacity', 0).appendTo(self.cardContainer);
            $elem.css('transform', 'scale(1.8) translate(200px,-50px) rotate(15deg)').each(function(i) {
                var $el = $(this);
                $el.css({
                    'transition': 'all .5s ease-out ' + 0.1 * i + 's'
                });
                // 设置后可以依次入场 / 先将设置属性添加到任务队列
                setTimeout(function() {
                    $el.css({ 'transform': 'translate(' + i * 1.5 + 'px, 0px)', 'opacity': 1 });
                }, 25);

            });
        },
        // 抽奖过程中的动画效果
        highlight: function(index) {
            var self = this;
            self.runTimes++;

            // 获取元素 tranform 中的 translate3d 的 x & y 值
            var x = self.cards.eq(index).css('transform').split(', ')[4];
            var y = self.cards.eq(index).css('transform').split(', ')[5].slice(0, -1);

            // console.log(y);
            // 确保元素只有 y 值位移变化
            self.cards.eq(index).css('transform', 'translate(' + x + 'px,' + (y - 40) + 'px)');
            // 元素位置定时还原
            // setTimeout(function() { 
            //     self.cards.eq(index).css('transform', 'translate('+ x +'px,'+ y +'px)'); 
            // }, self.options.drawingSpeed);

        },
        // 开始抽奖
        start: function() {
            var self = this;

            // 每轮结束设置
            // if( self.drawingCardsNum == 0 ){
            //     return;
            // }

            if (self.options.autoDrawing) {

                clearTimeout(self.timer);
                //self.shuffle();
                self.arrange(25, 20, 1);
                //随机函数，关键一步
                self.luckyNum = random(self.totalNum);
                //console.log(self.luckyNum);

                self.highlight(self.luckyNum);

                self.timer = setTimeout(function() {

                    self.start()

                }, self.options.drawingSpeed);

            } else {

                self.arrange(25, 20, 1);

            }

            this.isDrawing = true;
            //this.options.drawingCardsNum--;

        },
        // 停止抽奖并显示中奖用户
        stop: function() {
            var self = this;

            if (self.isDrawing) {
                // 判断抽奖是否结束
                var drawingEnd = --self.drawingCardsNum <= 0 ? true : false;

                // console.log(self.options.drawingCardsNum);
                console.log(self.luckyNum); // 测试打印中奖号
                self.showLucky(self.luckyNum);
                //移除中奖用户
                self.cards.splice(self.luckyNum, 1);
                self.arrange(25, 20, 1);
                self.totalNum--;

                self.isDrawing = false;

                //先打印再清除计时器
                if (drawingEnd) {
                    clearTimeout(self.timer);
                    self.shuffle();
                    return;
                };

            }

        },
        // 中奖用户展示
        showLucky: function(luckyNum) {
            var self = this;
            // 中奖卡片依次排列
            self.cards.eq(luckyNum).css({
                'transform': 'translate(' + (self.options.drawingCardsNum - self.drawingCardsNum - 1) * this.cardWidth + 'px,-140px)',
                'z-index': 0
            });

        },

        // 卡片翻转
        turnItem: function(luckyNum) {
            var self = this;

            self.cards.eq(luckyNum).css({
                'transform': 'translate(90px) rotateY(-179.9deg)'
            });

            // 卡片单击翻转
            self.cards.click(function(e) {

                e.preventDefault();
                e.stopPropagation();

                // 设置手动抽则不能翻转
                if (!self.options.autoDrawing) {
                    // 获取元素 tranform 中的 translate3d 的 x & y 值
                    var x = $(this).css('transform').split(', ')[4];
                    var y = $(this).css('transform').split(', ')[5].slice(0, -1);
                    // console.log(x,y);
                    var index = $(this).css('z-index');
                    self.luckyNum = index;

                    $(this).css({
                        'transform': 'translate(' + (parseInt(x) + 90) + 'px, ' + y + 'px ) rotateY(-179.9deg)'
                    });

                    // self.showLucky(index);
                    setTimeout(function() {

                        self.stop();

                    }, 1000);

                    // 设置标识符，抽完一轮为止
                    if (self.drawingCardsNum > 0) {
                        self.isDrawing = true;
                    }

                };

            });
        },
        // 事件初始化
        initEvents: function() {
            var self = this;

            $('#start').click(function() {
                if (self.totalNum < 2) {
                    alert('The number is too small!')
                    return;
                }
                self.start();
            });

            $('#stop').click(function() {
                self.stop();
            });

            $('#shuffle').click(function() {
                self.shuffle();
            });

            $('#arrange').click(function() {
                self.arrange(25, 20, 1);
            });

            $('#reset').click(function() {
                self.drawingCardsNum = self.options.drawingCardsNum;
            });

        },
        // 弹出提示
        popUp: function() {

        }

    };

    var logError = function(message) {
        if (window.console) {
            console.error(message);
        }
    };

    // 设置 jQuery 插件
    $.fn.cardshow = function(options) {

        var instance = $.data(this, 'cardshow');

        if (typeof options === 'string') {

            var args = Array.prototype.slice.call(arguments, 1);

            this.each(function() {
                if (!instance) {
                    logError("cannot call methods on cardshow prior to initialization; " +
                        "attempted to call method '" + options + "'");
                    return;
                }
                if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
                    logError("no such method '" + options + "' for cardshow instance");
                    return;
                }

                instance[options].apply(instance, args);
            });

        } else {

            this.each(function() {
                if (instance) {
                    instance.init();
                } else {
                    instance = $.data(this, 'cardshow', new $.CardShow(this, options));
                }
            });
        }

        return instance;
    }

})(window, jQuery);
