/**
 * cardshow.js v1.3.0
 * 
 * Released under the MIT license
 * 
 * Copyright 2016 by nzbin
 *
 */


;
(function(window, $) {

    'use strict';

    $.CardShow = function(el, options) {

        this.cardContainer = $(el);
        // 初始化插件
        this.init(options);
        // 初始化事件
        this.initEvents();

    }

    $.CardShow.defaults = {
        // 抽奖用户数据，根据需要传值，为字符串数据
        src: '',
        // 自动抽取或者手动抽取
        autoDrawing: true,
        // 是否背面显示
        backface: true,
        // 用户数过多时，分行显示，建议最大为 3
        rows: 1,
        // 每轮次抽取的数量，默认为一张
        drawingCardsNum: 1,
        // 抽奖轮次，默认值为 0 ，不限次
        drawingRounds: 0,
        // 自动抽取的速度
        drawingSpeed: 300,
    };

    $.CardShow.prototype = {

        init: function(options) {

            var transEndEventNames = {
                'WebkitTransition': 'webkitTransitionEnd',
                'MozTransition': 'transitionend',
                'OTransition': 'oTransitionEnd',
                'msTransition': 'MSTransitionEnd',
                'transition': 'transitionend'
            };

            this.transEndEventName = transEndEventNames[Modernizr.prefixed('transition')];
            this.supportPreserve3d = Modernizr.preserve3d; // 针对 IE

            this.containerWidth = this.cardContainer.width();
            this.containerHeight = this.cardContainer.height();
            // 中奖号
            this.luckyNum = 0;
            // 避免开始连击
            this.isStarting = false;
            // 是否正在抽奖
            this.isDrawing = false;
            // 单次抽奖是否结束，避免连击
            this.isAnimating = true;
            // 随机数产生次数
            this.runTimes = 0;
            // 扩展 options
            this.options = $.extend(true, {}, $.CardShow.defaults, options);
            // 保存抽卡数
            this.drawingCardsNum = this.options.drawingCardsNum;
            // 保存抽卡轮次
            this.drawingRounds = this.options.drawingRounds;
            // 插入数据
            this.setData();
            // 卡片飞出
            this.entrance(this.cards);
            // 卡片尺寸信息（通过 CSS 设置卡片尺寸更方便）必须在卡片飞出后设置
            this.cardWidth = this.cardContainer.find('li').width();
            this.cardHeight = this.cardContainer.find('li').height();

            this.turnItem();

            // 解决 chrome/opera 打开时 onresize 就执行的 bug
            var widthFlag = window.innerWidth;
            this.resize(widthFlag);

        },
        setData: function() {
            // 方法一
            // this.cardContainer.html(this.options.src);
            // this.cards = this.cardContainer.find('li');

            // 先清空数据
            this.cardContainer.html('');
            // 获取所有卡片
            this.cards = $(this.options.src);
            // 参加抽奖用户总数
            this.totalNum = this.cards.length;

        },
        // 产生相邻不重复的随机数，n 为随机数个数
        random: function(n) {
            var self = this;

            var rand = Math.floor(Math.random() * n);

            if (rand == self.luckyNum) {
                return self.random(n);
            } else {
                self.luckyNum = rand;
                return self.luckyNum;
            }

        },
        // 数组重排
        shuffle: function() {
            var self = this;

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

            if (!self.isDrawing) {

                shuffleArr(self.cards);
                self.arrange(1.5, 0, 0);

            }
        },

        // 设置用户信息卡片排列位置，
        // x ,y 表示卡片间隔，pos 表示初始位置还是排列位置 0 || 1
        arrange: function(x, y, pos) {
            var self = this;

            if (!self.isDrawing) {
                // shuffleArr(this.cards);
                this.cards.css('transition', 'all ' + self.options.drawingSpeed + 'ms ease-in-out');

                if (!pos) {
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

                // 计算每行卡片数
                var rowsNum = Math.ceil(self.totalNum / self.options.rows);
                // 根据卡片数量布局，禁止超出屏幕，如果 x 值过大则根据容器宽度计算
                if ((rowsNum - 1) * x + self.cardWidth > self.containerWidth) {
                    x = (self.containerWidth - self.cardWidth) / (rowsNum - 1);
                }
                // 循环添加每张卡片的位移
                for (var i = 0; i < self.options.rows; i++) {
                    // 根据行数进行卡片分组
                    self.cards.slice(rowsNum * i, rowsNum * (i + 1))
                        .each(function(j) {
                            $(this).css({
                                'transform': 'translate(' + j * x + 'px, ' + (self.cardHeight * i + y * i) * pos + 'px)',
                                //'transition': 'all ' + self.options.drawingSpeed + 'ms '+ 'ease ' + self.options.drawingSpeed*0.5*(rowsNum-j) + 'ms' ,
                                'z-index': j + rowsNum * i
                            });
                        });
                        
                }

            }

        },
        // 卡片入场动画
        entrance: function($elem) {
            var self = this;
            // 卡片入场时先洗牌，解决火狐卡顿问题
            self.shuffle();

            var cardFront = $elem.find('.card-front');
            var cardBack = $elem.find('.card-back');

            // 如果设置背面显示
            if (self.options.backface) {

                self.supportPreserve3d ? cardFront.css('transform', 'rotateY(180deg)') : cardFront.css('display', 'none')

            } else {

                self.supportPreserve3d ? cardBack.css('transform', 'rotateY(180deg)') : cardFront.css('display', 'none')

            }

            // 将数据添加到父元素中
            $elem.css('opacity', 0).appendTo(self.cardContainer);
            // 循环添加动画
            $elem.css('transform', 'scale(1.8) translate(50px,-200px) rotate(15deg)').each(function(i) {
                var $el = $(this);
                $el.css({
                    'transition': 'all 500ms ease-out ' + 100 * i + 'ms',
                    'z-index': i
                });
                // 设置后可以依次入场 / 先将设置属性添加到任务队列
                setTimeout(function() {
                    $el.css({ 'transform': 'translate(' + i * 1.5 + 'px, 0px)', 'opacity': 1 });
                }, 25);

            });
            // 绑定 transitionend 事件
            $elem.on(self.transEndEventName, function() {
                $(this).css('transition', 'all ' + self.options.drawingSpeed + 'ms ease-in-out');
            });

        },
        // 抽奖过程中的动画效果
        highlight: function(index) {
            var self = this;

            // 获取元素 tranform 中的 translate3d 的 x & y 值
            var x = self.cards.eq(index).css('transform').split(', ')[4];
            var y = self.cards.eq(index).css('transform').split(', ')[5].slice(0, -1);

            // console.log(y);
            // 确保元素只有 y 值位移变化
            self.cards.eq(index).css('transform', 'translate(' + x + 'px,' + (y - 20) + 'px)');
            // 元素位置定时还原
            setTimeout(function() {
                self.cards.eq(index).css('transform', 'translate(' + x + 'px,' + y + 'px)');
            }, self.options.drawingSpeed);

        },
        // 循环抽奖函数
        drawing: function() {
            var self = this;

            clearTimeout(self.timer);
            //self.arrange(25, 20, 1);
            // 随机函数，关键一步
            self.luckyNum = self.random(self.totalNum);

            self.highlight(self.luckyNum);

            self.timer = setTimeout(function() {

                self.drawing()

            }, self.options.drawingSpeed);

        },
        // 开始抽奖
        start: function() {
            var self = this;

            // 轮次结束返回
            if (self.options.drawingRounds != 0) {

                if (--self.drawingRounds < 0) {
                    alert('The game is over,please refresh!');
                    return;
                }

            }

            // 卡片数过少返回
            if (self.totalNum < 10) {
                alert('The number is too small!');
                return;
            }

            // 避免开始按钮连击
            if (!self.isStarting) {

                self.isStarting = true;
                // 每次开始抽则重设单次抽卡数
                self.drawingCardsNum = self.options.drawingCardsNum;

                setTimeout(function() {
                    self.arrange(25, 20, 1);
                }, 1000);

                if (self.options.autoDrawing) {

                    setTimeout(function() {
                        self.drawing();
                    }, 1500);

                }
                // 设置卡片排列结束后才可以抽出
                setTimeout(function() {

                    self.isDrawing = true;

                }, 1500);

            }

        },
        // 停止抽奖并显示中奖用户
        stop: function() {
            var self = this;

            if (self.isDrawing) {

                if (self.options.autoDrawing) {

                    // 设置变量，避免结束按钮连击
                    if (self.isAnimating) {

                        self.isAnimating = false;

                        self.runTimes++;
                        // 判断抽奖是否结束
                        var drawingEnd = --self.drawingCardsNum <= 0 ? true : false;
                        // 如果是背面则有翻转动作
                        if (self.options.backface) {
                            self.turnItem(self.luckyNum);
                        }

                        console.log(self.luckyNum); // 测试打印中奖号
                        self.showLucky(self.luckyNum);
                        //移除中奖用户
                        self.cards.splice(self.luckyNum, 1);

                        //self.arrange(25, 20, 1);

                        self.totalNum--;

                        //先打印再清除计时器
                        if (drawingEnd) {
                            clearTimeout(self.timer);
                            self.isStarting = false;
                            self.isDrawing = false;
                            // 抽完定时收起卡片
                            setTimeout(function() {
                                self.shuffle();
                            }, 1000);
                        };

                    }

                }

            }

        },
        // 中奖用户展示
        showLucky: function(luckyNum) {
            var self = this;

            if (!self.supportPreserve3d || !self.options.backface) {

                self.isAnimating = true;

                // IE 因为没有翻转所以需要减一个宽度
                var x = (self.runTimes - 1) * self.cardWidth;
                var y = parseInt(self.cardHeight) + 20;

                //setTimeout(function(){
                // 中奖卡片依次排列
                self.cards.eq(luckyNum).css({
                    'transform': 'translate(' + x + 'px,' + -y + 'px)',
                    'z-index': self.runTimes + 999
                });
                //},500);

                return;
            }

            if (self.options.backface) {
                if (this.isDrawing) {
                    // 中奖卡片依次排列添加翻转
                    self.cards.eq(luckyNum).on(self.transEndEventName, function() {

                        self.isAnimating = true;

                        var x = self.runTimes * self.cardWidth;
                        var y = parseInt(self.cardHeight) + 20;

                        // 先移除事件
                        $(this).off(self.transEndEventName);
                        $(this).css({
                            'transform': 'translate(' + x + 'px,' + -y + 'px) rotateY(-179.9deg)',
                            'z-index': self.runTimes + 999
                        });
                    });

                }
            }

        },

        // 卡片翻转
        turnItem: function(luckyNum) {
            var self = this;
            // 自动抽翻转
            if (self.options.autoDrawing) {

                if (self.isDrawing) {
                    var x = self.cards.eq(luckyNum).css('transform').split(', ')[4];
                    var y = self.cards.eq(luckyNum).css('transform').split(', ')[5].slice(0, -1);

                    if (self.supportPreserve3d) {

                        self.cards.eq(luckyNum).css({
                            'transform': 'translate(' + (parseInt(x) + 90) + 'px, ' + y + 'px ) rotateY(-179.9deg)',
                            'z-index': self.runTimes + 999
                        });

                    } else {

                        self.cards.eq(luckyNum).find('.card-front').css('display', 'block').siblings('.card-back').css('display', 'none');

                    }
                }
            }

            // 卡片单击翻转抽奖
            self.cards.on('click.cardshow', function(e) {

                e.preventDefault();
                e.stopPropagation();

                var $el = $(this);

                if (self.isDrawing) {
                    // 手动抽翻转，自动抽不能翻转
                    if (!self.options.autoDrawing) {

                        self.runTimes++;
                        // 判断抽奖是否结束
                        var drawingEnd = --self.drawingCardsNum <= 0 ? true : false;
                        // 获取元素 tranform 中的 translate3d 的 x & y 值
                        var x = $el.css('transform').split(', ')[4];
                        var y = $el.css('transform').split(', ')[5].slice(0, -1);
                        // console.log(x,y);
                        // 获取点击元素在数组中的位置 / 中奖号
                        self.luckyNum = self.cards.index($el);

                        if (self.options.backface) {
                            if (self.supportPreserve3d) {

                                $el.css({
                                    'transform': 'translate(' + (parseInt(x) + 90) + 'px, ' + y + 'px ) rotateY(-179.9deg)',
                                    'z-index': self.runTimes + 999
                                });

                            } else {

                                $el.css('z-index', '999').find('.card-front').css('display', 'block').siblings('.card-back').css('display', 'none');

                            }
                        }

                        console.log(self.luckyNum); // 测试打印中奖号
                        self.showLucky(self.luckyNum);
                        // 移除中奖用户
                        self.cards.splice(self.luckyNum, 1);
                        // 手动抽必须重排，可以修复奇怪问题，已修复
                        //self.arrange(25, 20, 1);

                        self.totalNum--;

                        // 设置标识符，抽完一轮为止
                        if (drawingEnd) {
                            self.isStarting = false;
                            self.isDrawing = false;
                            // 抽完定时收起卡片
                            setTimeout(function() {
                                self.shuffle();
                            }, 1000);
                        }

                    }

                }

            });
        },
        // 窗口变化事件
        resize: function(flag) {
            var self = this;

            // 函数节流 impress.js
            var throttle = function(fn, delay) {

                var timer = null;

                return function() {
                    var context = this,
                        args = arguments;

                    clearTimeout(timer);

                    timer = setTimeout(function() {
                        fn.apply(context, args);
                    }, delay);
                };
            };

            window.onresize = throttle(function() {
                // 通过宽度变化对比，避免浏览器刚打开就执行事件
                var widthFlagResize = window.innerWidth;

                if (flag != widthFlagResize) {
                    self.init(self.options);
                }

            }, 1500);

        },
        // 默认事件
        initEvents: function() {
            var self = this;

            $('#start').on('click', function() {
                self.start();
            });

            $('#stop').on('click', function() {
                self.stop();
            });

            $('#shuffle').on('click', function() {
                self.shuffle();
            });

            $('#arrange').on('click', function() {
                self.arrange(25, 20, 1);
            });

            $('#reset').on('click', function() {
                self.runTimes = 0;
            });
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