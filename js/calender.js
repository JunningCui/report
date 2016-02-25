;(function (doc, win) {
var docEl = doc.documentElement,
  resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize',
  recalc = function () {
    var clientWidth = docEl.clientWidth;
    var clientHeight = docEl.clientHeight;
    if (!clientWidth) return;
    if (clientWidth < clientHeight) {
        docEl.style.fontSize = 100 * (clientWidth / 640) + 'px';
    }else{
      docEl.style.fontSize = 50 * (clientWidth / 1175) + 'px';
    }
  };
// if (!doc.addEventListener) return;
    win.addEventListener(resizeEvt, recalc, false);
    doc.addEventListener('DOMContentLoaded', recalc, false);   
})(document, window);

;(function ($){
    $.fn.popDiv = function (options){
        var defaults = {
            id:'#popBox',
            confirmBtn: '',
            cancelBtn: '',
            headTitle:'标题',
            confirmBtnText:'确定',
            cancelBtnText:'取消',
            confirmBtnEvent:function (){},
            cancelBtnEvent:function (){pop.hide();}
        }
        var ops = $.extend(defaults,options);
        var pop = {
            init : function (){
                    $(".popDiv").each(function (){
                        var el = this;
                        var _idFlag = $(this).find(ops.id);
                        var _confirmBtn = $(ops.confirmBtn);
                        var _cancelBtn = $(ops.cancelBtn);
                        if(_idFlag.length == 0){
                            return;
                        }else{
                                pop.show(_idFlag);
                                pop.hide(_idFlag);
                                pop.headTitlePutText(ops.headTitle);
                           // 判断是否有按钮事件
                            if(_confirmBtn == ''){
                                return;
                            }else{
                                ops.confirmBtnEvent();
                                pop.btnPutText(_confirmBtn,ops.confirmBtnText)
                            }
                            if(_cancelBtn == ''){
                                return;
                            }else{
                                pop.btnPutText(_cancelBtn,ops.cancelBtnText)
                                ops.cancelBtnEvent();
                            }
                        }
                    })
                },
            hide : function (_idFlag){
                   $(_idFlag).siblings(".popBg").on('click',function (){
                    $(".popDiv").hide();
                   });
            },
            show : function (_idFlag){
                $(_idFlag).parents(".popDiv").show();
            },
            btnPutText : function (_btn,btnText){
                $(_btn).text(btnText)
            },
            headTitlePutText :function (headTitle){
                $(ops.id).find(".tipHead").text(headTitle)
            }
        }
        pop.init();
    }
})(Zepto);


    //    var myScroll = new iScroll('wl1');
(function () {
        //！！！由于动画原因，获取值可能会出现不准确的情况，比如正在动画却已经取值了
        //所以设置了一个冷却时间，在冷却时间的情况下设置值等操作不能进行
        //为了保证唯一性，全部使用index作为索引算了
        var ScrollRadio = function (opts) {
            opts = opts || {};
            //容器元素
            this.wrapper = opts.wrapper || $(document);
            var id = new Date().getTime() + Math.random() + 'id';
            this.body = [
    '<div class="cui-roller">',
    '<ul class="ul-list" style=" position: absolute; width: 100%; z-index: 2;  "  id="' + id + '" >',
    '</ul>',
    '<div class="cui-mask"></div>',
    '<div class="cui-lines"> </div>',
    '</div>'
    ].join('');
            this.body = $(this.body);

            //真正拖动的元素（现在是ul）
            this.dragEl = this.body.find('.ul-list');
            //数据源
            this.data = opts.data || [];
            this._changed = opts.changed || null;
            //当前选项索引默认选择2项
            this.selectedIndex = 1;

            //当前选项值
            //                this.key = '';
            //当前选项显示的值
            //                this.value = '';

            /*
            定位实际需要用到的信息
            暂时不考虑水平移动吧
            */
            this.itemHeight = 0; //单个item高度
            this.dragHeight = 0; //拖动元素高度
            this.dragTop = 0; //拖动元素top
            this.animateParam = [10, 9, 8, 6, 4, 2, 1, 0, 0, 0, 0]; //动画参数
            this.timeGap = 0; //时间间隔
            this.touchTime = 0; //开始时间
            this.moveAble = false; //是否正在移动
            this.moveState = 'up'; //移动状态，up right down left
            this.oTop = 0; //拖动前的top值
            this.curTop = 0; //当前容器top
            this.mouseY = 0; //鼠标第一次点下时相对父容器的位置
            this.cooling = false; //是否处于冷却时间

            this.init();
        };
        ScrollRadio.prototype = {
            constructor: ScrollRadio,
            init: function () {
                this.initItem();
                this.wrapper.append(this.body);
                this.initEventParam();
                this.bindEvent();
            },
            //增加数据
            initItem: function () {
                var _tmp, _data, i, k;
                for (var i in this.data) {
                    _data = this.data[i]
                    _tmp = $('<li>' + (_data.val == undefined ? i : _data.val) + '</li>');
                    _tmp.attr('data-index', i);
                    for (k in _data) {
                        _tmp.attr('data-' + k, _data[k]);
                    }
                    this.dragEl.append(_tmp);
                }
            },
            //初始化事件需要用到的参数信息
            initEventParam: function () {
                var offset = this.dragEl.offset();
                var itemOffset = this.dragEl.find('li').eq(0).offset();
                this.itemHeight = itemOffset.height
                this.dragTop = offset.top;
                this.dragHeight = this.dragEl[0].scrollHeight;
                var s = '';
            },
            bindEvent: function () {
                var scope = this;
                this.dragEl[0].addEventListener("touchstart", function (e) {
                    scope.touchStart.call(scope, e);
                }, false);
                this.dragEl[0].addEventListener("touchend", function (e) {
                    scope.touchEnd.call(scope, e);
                }, false);
                this.dragEl[0].addEventListener("touchmove", function (e) {
                    scope.touchMove.call(scope, e);
                }, false);
            },
            touchStart: function (e) {
                if (this.cooling) return false; //冷却时间不能开始

                //需要判断是否是拉取元素，此处需要递归验证，这里暂时不管
                //！！！！！！！！此处不严谨
                var el = $(e.srcElement).parent(), pos;
                if (el.hasClass('ul-list')) {
                    this.moveAble = true;

                    this.touchTime = e.timeStamp;
                    //获取鼠标信息
                    pos = this.getMousePos(e.changedTouches[0]);
                    //注意，此处是相对位置，注意该处还与动画有关，所以高度必须动态计算
                    //可以设置一个冷却时间参数，但想想还是算了
                    //最后还是使用了冷却时间
                    //                        var top = parseFloat(this.dragEl.css('top')) || 0;
                    //                        this.mouseY = pos.top - top;
                    this.mouseY = pos.top - this.curTop;
                    this.moveAble = true;
                }
            },
            touchMove: function (e) {
                if (!this.moveAble) return false;
                var pos = this.getMousePos(e.changedTouches[0]);
                //先获取相对容器的位置，在将两个鼠标位置相减
                this.curTop = pos.top - this.mouseY;
                this.dragEl.css('top', this.curTop + 'px');
                e.preventDefault();
            },
            touchEnd: function (e) {
                if (!this.moveAble) return false;
                this.cooling = true; //开启冷却时间

                //时间间隔
                var scope = this;
                this.timeGap = e.timeStamp - this.touchTime;
                var flag = this.oTop <= this.curTop ? 1 : -1; //判断是向上还是向下滚动
                var flag2 = this.curTop > 0 ? 1 : -1; //这个会影响后面的计算结果
                this.moveState = flag > 0 ? 'up' : 'down';
                var ih = parseFloat(this.itemHeight);
                var ih1 = ih / 2;

                var top = Math.abs(this.curTop);
                var mod = top % ih;
                top = (parseInt(top / ih) * ih + (mod > ih1 ? ih : 0)) * flag2;

                var step = parseInt(this.timeGap / 50);
                step = step > 0 ? step : 0;
                var speed = this.animateParam[step] || 0;
                var increment = speed * ih * flag
                top += increment;
                //！！！此处动画可能导致数据不同步，后期改造需要加入冷却时间
                if (this.oTop != this.curTop) {
                    this.dragEl.animate({
                        top: top + 'px'
                    }, 100 + (speed * 20), 'ease-out', function () {
                        var _top = top, t = false; ;
                        if (top > ih) {
                            _top = ih;
                            t = true;
                        }
                        if (top < 0 && (top + scope.dragHeight < ih * 2)) {
                            t = true;
                            _top = (scope.dragHeight - ih * 2) * (-1);
                        }
                        if (t) {
                            scope.dragEl.animate({
                                top: _top + 'px'
                            }, 10, 'ease-in-out', function () {
                                scope.oTop = _top;
                                scope.curTop = _top;
                                scope.cooling = false; //关闭冷却时间
                                scope.onTouchEnd();
                            });
                        } else {
                            scope.cooling = false; //关闭冷却时间
                            scope.oTop = top;
                            scope.curTop = top;
                            scope.onTouchEnd();
                        }
                    });
                } else {
                    this.cooling = false; //关闭冷却时间
                    this.onTouchEnd();
                }
                this.moveAble = false;
            },
            onTouchEnd: function () {
                var i = parseInt((this.curTop - this.itemHeight) / parseFloat(this.itemHeight));
                this.selectedIndex = Math.abs(i);
                var secItem = this.data[this.selectedIndex];
                //触发变化事件
                var changed = this._changed;
                if (changed && typeof changed == 'function') {
                    changed.call(this, secItem);
                }
                console.log(this.selectedIndex, secItem);
            },
            setKey: function (k) { },
            setVal: function (v) { },
            setIndex: function (i) {
                var i = parseInt(i);
                if (i >= this.data.length || i < 0) return false;

                this.selectedIndex = i;
                this.curTop = (i * this.itemHeight * (-1) + this.itemHeight);
                this.dragEl.css('top', this.curTop + 'px');
            },
            getSelected: function () {
                return this.data[this.selectedIndex];
            },
            getByKey: function (k) { },
            getByVal: function (v) { },
            getByIndex: function (i) { },
            //获取鼠标信息
            getMousePos: function (event) {
                var top, left;
                top = Math.max(document.body.scrollTop, document.documentElement.scrollTop);
                left = Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
                return {
                    top: top + event.clientY,
                    left: left + event.clientX
                };
            }
        };
        window.ScrollRadio = ScrollRadio;

    })();





