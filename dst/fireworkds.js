var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var test;
(function (test) {
    'use strict';
    var BaseView = /** @class */ (function () {
        function BaseView() {
            this.id = 0;
        }
        BaseView.prototype.setDrawingTime = function (value) {
            this.__drawingTime = value;
        };
        BaseView.prototype.getDrawingTime = function () {
            return this.__drawingTime;
        };
        BaseView.prototype.onDraw = function (canvas) { };
        BaseView.prototype.invalidate = function () {
            if (this.parent != null) {
                this.parent.invalidate();
            }
        };
        BaseView.prototype.startAnimation = function (animation) {
            this.animation = animation;
            if (this.animation != null) {
                this.getRootView().startAnimation(animation);
            }
        };
        BaseView.prototype.getRootView = function () {
            if (this.parent != null) {
                var parent_1 = this.parent;
                while (parent_1.parent != null) {
                    parent_1 = parent_1.parent;
                }
                return parent_1;
            }
            return this;
        };
        return BaseView;
    }());
    test.BaseView = BaseView;
    var ViewGroup = /** @class */ (function (_super) {
        __extends(ViewGroup, _super);
        function ViewGroup() {
            var _this = _super.call(this) || this;
            _this.children = [];
            return _this;
        }
        ViewGroup.prototype.addView = function (view) {
            this.children.push(view);
            view.parent = this;
        };
        ViewGroup.prototype.dispatchDraw = function (canvas) {
            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
                var view = _a[_i];
                view.setDrawingTime(Date.now());
                this.drawchild(canvas, view);
            }
        };
        ViewGroup.prototype.drawchild = function (canvas, view) {
            // console.log(this);
            // console.log("    " + (view.animation != null )+" ,");//+( !view.animation.isAniamtionEnd));
            if (view.animation != null && !view.animation.isAniamtionEnd) {
                canvas.save();
                if (view.animation.state == AnimationState.BeforeStart) {
                    view.animation.onStartAnimation(canvas, view);
                    view.animation.state = AnimationState.Animating;
                }
                view.animation.applyTransformation(view.animation.scale(view.getDrawingTime()), canvas, view);
                view.onDraw(canvas);
                if (view instanceof ViewGroup) {
                    view.dispatchDraw(canvas);
                }
                canvas.restore();
            }
            else {
                if (view.animation != null && view.animation.isAniamtionEnd && view.animation.state != AnimationState.End) {
                    view.animation.state = AnimationState.End;
                    view.animation.onEndAnimation(canvas, view);
                }
                view.onDraw(canvas);
                if (view instanceof ViewGroup) {
                    view.dispatchDraw(canvas);
                }
            }
        };
        return ViewGroup;
    }(BaseView));
    test.ViewGroup = ViewGroup;
    var RootView = /** @class */ (function (_super) {
        __extends(RootView, _super);
        function RootView() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        RootView.prototype.startAnimation = function (animation) {
            this.animation = animation;
            // setTimeout(this._startAnimation());
            this._startAnimation();
        };
        RootView.prototype._startAnimation = function () {
            this.animation.start = Date.now();
            if (this._rootAniamtion != null && !this._rootAniamtion.isAniamtionEnd) {
                if (this._rootAniamtion.duration + this._rootAniamtion.start < this.animation.duration + this.animation.start) {
                    this._rootAniamtion.duration = this.animation.start + this.animation.duration - this._rootAniamtion.start;
                }
            }
            else {
                this._rootAniamtion = this.animation;
                window.requestAnimationFrame(this._animate.bind(this));
                console.log("requestAnimationFrame ====== >>>>>  ");
            }
        };
        RootView.prototype._animate = function () {
            // console.log("_animating ========= >");
            if (this._rootAniamtion != null && !this._rootAniamtion.isAniamtionEnd) {
                this.invalidate();
                window.requestAnimationFrame(this._animate.bind(this));
            }
            else {
                this._rootAniamtion = null;
                this.invalidate();
            }
        };
        RootView.prototype.attach = function (element) {
            this._element = element;
            this._rect = { l: 0, t: 0, width: element.clientWidth, height: element.clientHeight };
            var canvasElement = document.createElement('canvas');
            this._element.appendChild(canvasElement);
            this._canvas = canvasElement.getContext('2d');
            canvasElement.width = this._rect.width;
            canvasElement.height = this._rect.height;
            canvasElement.style.width = this._rect.width + "px";
            canvasElement.style.height = this._rect.height + "px";
        };
        RootView.prototype.invalidate = function () {
            this._canvas.clearRect(this._rect.l, this._rect.t, this._rect.width, this._rect.height);
            this.dispatchDraw(this._canvas);
        };
        return RootView;
    }(ViewGroup));
    test.RootView = RootView;
    var AnimationState;
    (function (AnimationState) {
        AnimationState[AnimationState["BeforeStart"] = 0] = "BeforeStart";
        AnimationState[AnimationState["Animating"] = 1] = "Animating";
        AnimationState[AnimationState["End"] = 2] = "End";
    })(AnimationState = test.AnimationState || (test.AnimationState = {}));
    var AnimationEase = /** @class */ (function () {
        function AnimationEase() {
        }
        AnimationEase.prototype.ease = function (t) {
            return t;
        };
        return AnimationEase;
    }());
    test.AnimationEase = AnimationEase;
    var Animation = /** @class */ (function () {
        function Animation() {
            this.duration = 0;
            this.ease = new AnimationEase();
            this.start = 0;
            this.duration = 0;
            this.from = 1;
            this.to = 1;
            this.state = AnimationState.BeforeStart;
        }
        Object.defineProperty(Animation.prototype, "isAniamtionEnd", {
            get: function () {
                var flg = this.start + this.duration < Date.now();
                // console.log("isAnimationEnd  " + this.start + " duration " +this.duration +" now " + Date.now()  +" "  +flg);
                return flg;
            },
            enumerable: true,
            configurable: true
        });
        Animation.prototype.onStartAnimation = function (canvas, view) {
        };
        Animation.prototype.onEndAnimation = function (canvas, view) {
        };
        Animation.prototype.__onInneranimationEnd = function (canvas, view) { };
        Animation.prototype.scale = function (now) {
            return this.ease.ease((now - this.start) / this.duration);
        };
        Animation.prototype.applyTransformation = function (interpolatedTime, canvas, view) {
        };
        return Animation;
    }());
    test.Animation = Animation;
})(test || (test = {}));
/// <reference path="./Base.ts" />
var test;
(function (test) {
    'use strict';
    var Color = ['rgb(251, 118, 123)', 'rgb(129, 227, 238)', '#88bde6', '#fbb258', '#90cd97', '#f6aac9', '#bfa554', '#bc99c7', '#eddd46', '#f07e6e', '#8c8c8c'];
    var Point = /** @class */ (function () {
        function Point(x, y) {
            this.x = 0;
            this.y = 0;
            if (x != null) {
                this.x = x;
            }
            if (y != null) {
                this.y = y;
            }
        }
        return Point;
    }());
    test.Point = Point;
    var FireWorksBombView = /** @class */ (function (_super) {
        __extends(FireWorksBombView, _super);
        function FireWorksBombView(cx, cy, angle, radius) {
            var _this = _super.call(this) || this;
            _this.alpha = 1;
            var xs = [], ys = [];
            xs[0] = cx;
            ys[0] = cy;
            xs[1] = Math.cos(angle) * radius + cx;
            ys[1] = Math.sin(Math.random() * Math.PI) * Math.sin(angle) * radius + cy;
            xs[2] = xs[1];
            ys[2] = cy + radius;
            xs[3] = xs[2];
            ys[3] = ys[2] + radius + Math.random() * 20;
            var startPt = new Point(xs[0], ys[0]);
            var endPt = new Point(xs[1], ys[1]);
            var spline = new Spline(xs, ys);
            var result = spline.calculate();
            _this.xs = result.xs;
            _this.ys = result.ys;
            var linexs = [];
            var lineys = [];
            _this.xs = linexs.concat(_this.xs);
            _this.ys = lineys.concat(_this.ys);
            _this.renderXs = [];
            _this.renderYs = [];
            return _this;
        }
        FireWorksBombView.prototype.onDraw = function (canvas) {
            _super.prototype.onDraw.call(this, canvas);
            var index = this.id; //Math.floor(Math.random() * 100);
            var radius = 2;
            var len = this.renderYs.length;
            canvas.save();
            canvas.globalAlpha = this.alpha;
            canvas.fillStyle = Color[index % Color.length];
            canvas.beginPath();
            canvas.arc(this.renderXs[len - 1], this.renderYs[len - 1], radius, 0, 2 * Math.PI);
            var resultxs = [];
            var resultys = [];
            var nextx = 0;
            var nexty = 0;
            var lasta = 0;
            var padding = 5;
            for (var i = 0; i < this.renderXs.length; ++i) {
                padding = i / this.renderXs.length * radius;
                var x = this.renderXs[i];
                var y = this.renderYs[i];
                var nextx = x;
                var nexty = y;
                var a = lasta;
                if (i + 1 < this.renderXs.length) {
                    nextx = this.renderXs[i + 1];
                    nexty = this.renderYs[i + 1];
                    a = Math.atan((nexty - y) / (nextx - x));
                    lasta = a;
                }
                var xoffset = padding * Math.sin(a);
                var yoffset = padding * Math.cos(a);
                resultxs[2 * i] = x + xoffset;
                resultys[2 * i] = y - yoffset;
                resultxs[2 * i + 1] = nextx + xoffset;
                resultys[2 * i + 1] = nexty - yoffset;
                resultxs[4 * len - 2 * i - 2] = nextx - xoffset;
                resultys[4 * len - 2 * i - 2] = nexty + yoffset;
                resultxs[4 * len - 2 * i - 1] = x - xoffset;
                resultys[4 * len - 2 * i - 1] = y + yoffset;
            }
            canvas.moveTo(resultxs[0], resultys[0]);
            for (var i_1 = 0; i_1 < resultxs.length; ++i_1) {
                canvas.lineTo(resultxs[i_1], resultys[i_1]);
            }
            //  ctx.stroke();
            canvas.fill();
            canvas.closePath();
            canvas.restore();
        };
        return FireWorksBombView;
    }(test.BaseView));
    test.FireWorksBombView = FireWorksBombView;
    var FireWorksBombView2 = /** @class */ (function (_super) {
        __extends(FireWorksBombView2, _super);
        function FireWorksBombView2(cx, cy, angle, radius) {
            var _this = _super.call(this) || this;
            _this.alpha = 1;
            // let xs:number[];
            // let ys:number[];
            _this.xs = [];
            _this.ys = [];
            // xs[0]= cx;
            // ys[0] =cy;
            var ex = Math.cos(angle) * radius + cx;
            var ey = Math.sin(Math.random() * Math.PI) * Math.sin(angle) * radius + cy;
            var dx = ex - cx;
            var dy = ey - cy;
            var size = 100;
            var stepx = dx / size;
            var stepy = dy / size;
            for (var i = 0; i < size; ++i) {
                _this.xs.push(cx + stepx * i);
                _this.ys.push(cy + stepy * i);
            }
            _this.renderXs = [];
            _this.renderYs = [];
            return _this;
        }
        FireWorksBombView2.prototype.onDraw = function (canvas) {
            _super.prototype.onDraw.call(this, canvas);
            var index = this.id; //Math.floor(Math.random() * 100);
            var radius = 2;
            var len = this.renderYs.length;
            canvas.save();
            canvas.globalAlpha = this.alpha;
            canvas.fillStyle = Color[index % Color.length];
            canvas.beginPath();
            canvas.arc(this.renderXs[len - 1], this.renderYs[len - 1], radius, 0, 2 * Math.PI);
            var resultxs = [];
            var resultys = [];
            var nextx = 0;
            var nexty = 0;
            var lasta = 0;
            var padding = 5;
            for (var i = 0; i < this.renderXs.length; ++i) {
                padding = i / this.renderXs.length * radius;
                var x = this.renderXs[i];
                var y = this.renderYs[i];
                var nextx = x;
                var nexty = y;
                var a = lasta;
                if (i + 1 < this.renderXs.length) {
                    nextx = this.renderXs[i + 1];
                    nexty = this.renderYs[i + 1];
                    a = Math.atan((nexty - y) / (nextx - x));
                    lasta = a;
                }
                var xoffset = padding * Math.sin(a);
                var yoffset = padding * Math.cos(a);
                resultxs[2 * i] = x + xoffset;
                resultys[2 * i] = y - yoffset;
                resultxs[2 * i + 1] = nextx + xoffset;
                resultys[2 * i + 1] = nexty - yoffset;
                resultxs[4 * len - 2 * i - 2] = nextx - xoffset;
                resultys[4 * len - 2 * i - 2] = nexty + yoffset;
                resultxs[4 * len - 2 * i - 1] = x - xoffset;
                resultys[4 * len - 2 * i - 1] = y + yoffset;
            }
            canvas.moveTo(resultxs[0], resultys[0]);
            for (var i_2 = 0; i_2 < resultxs.length; ++i_2) {
                canvas.lineTo(resultxs[i_2], resultys[i_2]);
            }
            canvas.fill();
            canvas.closePath();
            canvas.restore();
        };
        return FireWorksBombView2;
    }(test.BaseView));
    test.FireWorksBombView2 = FireWorksBombView2;
    var FireAnimation = /** @class */ (function (_super) {
        __extends(FireAnimation, _super);
        function FireAnimation() {
            var _this = _super.call(this) || this;
            _this.ease = new test.AnimationEase();
            return _this;
        }
        FireAnimation.prototype.applyTransformation = function (interpolatedTime, canvas, view) {
            var scale = this.from + (this.to - this.from) * interpolatedTime;
            var index = Math.floor((this.xs.length - 1) * scale);
            if (view instanceof FireWorksBombView || view instanceof FireWorksBombView2) {
                view.alpha = 1 - scale * 0.8;
                var size = 30;
                if (this.xs.length - 1 < index + size) {
                    size = this.xs.length - index - 1;
                }
                view.renderXs = this.xs.slice(index, index + size);
                view.renderYs = this.ys.slice(index, index + size);
            }
        };
        FireAnimation.prototype.onStartAnimation = function (canvas, view) {
            if (view instanceof FireWorksBombView || view instanceof FireWorksBombView2) {
                this.xs = view.xs.slice(0);
                this.ys = view.ys.slice(0);
            }
        };
        FireAnimation.prototype.onEndAnimation = function (canvas, view) {
            if (view instanceof FireWorksBombView || view instanceof FireWorksBombView2) {
                view.renderXs = [];
                view.renderYs = [];
            }
        };
        return FireAnimation;
    }(test.Animation));
    test.FireAnimation = FireAnimation;
    var FireWorksContainer = /** @class */ (function (_super) {
        __extends(FireWorksContainer, _super);
        function FireWorksContainer() {
            return _super.call(this) || this;
        }
        FireWorksContainer.prototype.onDraw = function (canvas) {
            _super.prototype.onDraw.call(this, canvas);
            if (this.renderX == null || this.renderY == null) {
                return;
            }
            var index = this.id;
            var radius = 5;
            canvas.save();
            canvas.fillStyle = Color[index % Color.length];
            canvas.beginPath();
            canvas.arc(this.renderX, this.renderY, radius, 0, 2 * Math.PI);
            var resultxs = [];
            var resultys = [];
            var nextx = 0;
            var nexty = 0;
            var lasta = 0;
            var padding = 5;
            resultxs[0] = this.renderX - radius;
            resultys[0] = this.renderY;
            resultxs[1] = this.renderX + radius;
            resultys[1] = this.renderY;
            resultxs[2] = this.renderX;
            resultys[2] = this.renderY + 100;
            canvas.moveTo(resultxs[0], resultys[0]);
            for (var i = 0; i < resultxs.length; ++i) {
                canvas.lineTo(resultxs[i], resultys[i]);
            }
            canvas.fill();
            canvas.closePath();
            canvas.restore();
        };
        return FireWorksContainer;
    }(test.ViewGroup));
    test.FireWorksContainer = FireWorksContainer;
    var LineAnimation = /** @class */ (function (_super) {
        __extends(LineAnimation, _super);
        function LineAnimation() {
            var _this = _super.call(this) || this;
            var index = Math.floor(Math.random() * 10);
            if (index % 3 == 0) {
                _this.ease = new PolyOutEase();
            }
            else if (index % 3 == 1) {
                _this.ease = new PolyInEase();
            }
            else {
                _this.ease = new test.AnimationEase();
            }
            return _this;
        }
        LineAnimation.prototype.applyTransformation = function (interpolatedTime, canvas, view) {
            var scale = this.from + (this.to - this.from) * interpolatedTime;
            if (view instanceof FireWorksContainer) {
                view.renderX = this.x; //+Math.random()*10-5;
                view.renderY = this.y - view.h * scale;
            }
        };
        LineAnimation.prototype.onStartAnimation = function (canvas, view) {
            if (view instanceof FireWorksContainer) {
                this.x = view.x;
                this.y = view.y;
            }
        };
        LineAnimation.prototype.onEndAnimation = function (canvas, view) {
            if (view instanceof FireWorksContainer) {
                view.renderX = null; // this.x;
                view.renderY = null; //this.y;
            }
        };
        return LineAnimation;
    }(test.Animation));
    test.LineAnimation = LineAnimation;
    var FireLayout = /** @class */ (function (_super) {
        __extends(FireLayout, _super);
        function FireLayout() {
            return _super.call(this) || this;
        }
        FireLayout.prototype.init = function () {
            for (var m = 0; m < 50; ++m) {
                var size = 400;
                var startAngle = 0; //*Math.PI/180;
                var endAngle = 360; // * Math.PI/180;
                var constcx = 400 + Math.random() * 300 - 150;
                var constcy = 200;
                var radius = 300;
                var fireWorksContainer = new FireWorksContainer();
                fireWorksContainer.h = 600;
                fireWorksContainer.x = constcx;
                fireWorksContainer.y = constcy + fireWorksContainer.h;
                for (var i = 0; i < size; ++i) {
                    var angle = (startAngle + (endAngle - startAngle) / size * i) * Math.PI / 180;
                    var xs = [];
                    var ys = [];
                    var cx = constcx; //+ Math.random() * 20;
                    var cy = constcy; //+ Math.random() * 20;
                    if (m % 2 == 0) {
                        var fire = new FireWorksBombView2(cx, cy, angle, radius + Math.random() * 100);
                        // let fire: FireWorksBombView = new FireWorksBombView(cx, cy, angle, radius);
                        fire.id = Math.floor(Math.random() * 100);
                        fireWorksContainer.addView(fire);
                    }
                    else {
                        var fire = new FireWorksBombView(cx, cy, angle, radius);
                        fire.id = Math.floor(Math.random() * 100);
                        fireWorksContainer.addView(fire);
                    }
                }
                this.addView(fireWorksContainer);
                fireWorksContainer.id = Math.floor(Math.random() * 100);
            }
        };
        FireLayout.prototype.animationTest = function () {
            var index = 0;
            var _loop_1 = function (view) {
                index++;
                setTimeout(function () {
                    if (view instanceof FireWorksContainer) {
                        var fireWorksContainer_1 = view;
                        var animation1 = new LineAnimation();
                        animation1.duration = 1000 + Math.random() * 1000;
                        animation1.from = 0;
                        animation1.to = 1;
                        fireWorksContainer_1.startAnimation(animation1);
                        var oldanimationEnd_1 = animation1.onEndAnimation;
                        animation1.onEndAnimation = function (canvas, view) {
                            oldanimationEnd_1(canvas, view);
                            for (var _i = 0, _e = fireWorksContainer_1.children; _i < _e.length; _i++) {
                                var view_1 = _e[_i];
                                var animation = new FireAnimation();
                                animation.duration = Math.random() * 1000 + 2000;
                                animation.from = 0;
                                animation.to = 1;
                                view_1.startAnimation(animation);
                            }
                        };
                    }
                }, index * (1000 + Math.random() * 1000));
            };
            for (var _i = 0, _e = this.children; _i < _e.length; _i++) {
                var view = _e[_i];
                _loop_1(view);
            }
        };
        return FireLayout;
    }(test.RootView));
    test.FireLayout = FireLayout;
    var Spline = /** @class */ (function () {
        function Spline(x, y) {
            // 
            this.k = 0.002;
            this._a = [];
            this._b = [];
            this._c = [];
            this._d = [];
            //  T^3     -1     +3    -3    +1     /
            //  T^2     +2     -5     4    -1    /
            //  T^1     -1      0     1     0   /  2
            //  T^0      0      2     0     0  /
            this.m = [
                [-1 * 0.5, +3 * 0.5, -3 * 0.5, +1 * 0.5],
                [+2 * 0.5, -5 * 0.5, +4 * 0.5, -1 * 0.5],
                [-1 * 0.5, 0, +1 * 0.5, 0],
                [0, +2 * 0.5, 0, 0],
            ];
            this._x = x;
            this._y = y;
            var len = this._len = Math.min(x.length, y.length);
            if (len > 3) {
                for (var i = 0; i < len - 1; i++) {
                    var p1 = (i == 0) ? new Point(x[i], y[i]) : new Point(x[i - 1], y[i - 1]);
                    var p2 = new Point(x[i], y[i]);
                    var p3 = new Point(x[i + 1], y[i + 1]);
                    var p4 = (i == len - 2) ? new Point(x[i + 1], y[i + 1]) : new Point(x[i + 2], y[i + 2]);
                    var a = new Point();
                    var b = new Point();
                    var c = new Point();
                    var d = new Point();
                    a.x = p1.x * this.m[0][0] + p2.x * this.m[0][1] + p3.x * this.m[0][2] + p4.x * this.m[0][3];
                    b.x = p1.x * this.m[1][0] + p2.x * this.m[1][1] + p3.x * this.m[1][2] + p4.x * this.m[1][3];
                    c.x = p1.x * this.m[2][0] + p2.x * this.m[2][1] + p3.x * this.m[2][2] + p4.x * this.m[2][3];
                    d.x = p1.x * this.m[3][0] + p2.x * this.m[3][1] + p3.x * this.m[3][2] + p4.x * this.m[3][3];
                    a.y = p1.y * this.m[0][0] + p2.y * this.m[0][1] + p3.y * this.m[0][2] + p4.y * this.m[0][3];
                    b.y = p1.y * this.m[1][0] + p2.y * this.m[1][1] + p3.y * this.m[1][2] + p4.y * this.m[1][3];
                    c.y = p1.y * this.m[2][0] + p2.y * this.m[2][1] + p3.y * this.m[2][2] + p4.y * this.m[2][3];
                    d.y = p1.y * this.m[3][0] + p2.y * this.m[3][1] + p3.y * this.m[3][2] + p4.y * this.m[3][3];
                    this._a.push(a);
                    this._b.push(b);
                    this._c.push(c);
                    this._d.push(d);
                }
            }
        }
        Spline.prototype.calculatePoint = function (val) {
            var i = Math.floor(val);
            if (i < 0) {
                i = 0;
            }
            if (i > this._len - 2) {
                i = this._len - 2;
            }
            var d = val - i;
            var x = ((this._a[i].x * d + this._b[i].x) * d + this._c[i].x) * d + this._d[i].x;
            var y = ((this._a[i].y * d + this._b[i].y) * d + this._c[i].y) * d + this._d[i].y;
            return { x: x, y: y };
        };
        Spline.prototype.calculate = function (xscale, yscale) {
            if (xscale === void 0) { xscale = 1; }
            if (yscale === void 0) { yscale = 1; }
            if (this._len <= 3) {
                return { xs: this._x, ys: this._y };
            }
            var xs = [];
            var ys = [];
            var p0 = this.calculatePoint(0);
            xs.push(p0.x);
            ys.push(p0.y);
            var delta = this._len * this.k;
            var dx = 3 * xscale;
            var dy = 3 * yscale;
            for (var i = delta; i <= this._len - 1; i += delta) {
                var p = this.calculatePoint(i);
                if (Math.abs(p0.x - p.x) >= dx || Math.abs(p0.y - p.y) >= dy) {
                    xs.push(p.x);
                    ys.push(p.y);
                    p0 = p;
                }
            }
            if (xs[xs.length - 1].x != p.x || ys[ys.length - 1].y != p.y) {
                xs.push(p.x);
                ys.push(p.y);
            }
            return { xs: xs, ys: ys };
        };
        return Spline;
    }());
    test.Spline = Spline;
    var PolyInEase = /** @class */ (function (_super) {
        __extends(PolyInEase, _super);
        function PolyInEase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PolyInEase.prototype.ease = function (t) {
            return Math.pow(t, 3);
        };
        return PolyInEase;
    }(test.AnimationEase));
    test.PolyInEase = PolyInEase;
    var PolyOutEase = /** @class */ (function (_super) {
        __extends(PolyOutEase, _super);
        function PolyOutEase() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        PolyOutEase.prototype.ease = function (t) {
            return 1 - Math.pow(1 - t, 3);
        };
        return PolyOutEase;
    }(test.AnimationEase));
    test.PolyOutEase = PolyOutEase;
    var FRAME = 60;
    var Bezier = /** @class */ (function () {
        function Bezier(xs, ys) {
            // this.controlPoints = [];
            this.xs = xs;
            this.ys = ys;
        }
        Bezier.prototype.buildBezierPoints = function () {
            // let points: Point[] = [];
            var xs = [];
            var ys = [];
            // let order = this.controlPoints.length - 1;
            var order = this.xs.length - 1;
            var delta = 1.0 / FRAME;
            for (var t = 0; t <= 1; t += delta) {
                // points.push(new Point(this.deCasteljauX(order, 0, t), this.deCasteljauY(order, 0, t)));
                xs.push(this.deCasteljauX(order, 0, t));
                ys.push(this.deCasteljauY(order, 0, t));
            }
            return { 'xs': xs, 'ys': ys };
        };
        Bezier.prototype.deCasteljauX = function (i, j, t) {
            if (i == 1) {
                // return (1 - t) * this.controlPoints[i].x + t * this.controlPoints[j + 1].x;
                return (1 - t) * this.xs[i] + t * this.xs[j + 1];
            }
            return (1 - t) * this.deCasteljauX(i - 1, j, t) + t * this.deCasteljauX(i - 1, j + 1, t);
        };
        Bezier.prototype.deCasteljauY = function (i, j, t) {
            if (i == 1) {
                return (1 - t) * this.ys[j] + t * this.ys[(j + 1)];
            }
            return (1 - t) * this.deCasteljauY(i - 1, j, t) + t * this.deCasteljauY(i - 1, j + 1, t);
        };
        return Bezier;
    }());
    test.Bezier = Bezier;
})(test || (test = {}));

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9CYXNlLnRzIiwic3JjL0ZpcmVXb3Jrcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBQUEsSUFBVSxJQUFJLENBdUxiO0FBdkxELFdBQVUsSUFBSTtJQUNWLFlBQVksQ0FBQztJQUNiO1FBQUE7WUFDSSxPQUFFLEdBQVEsQ0FBQyxDQUFDO1FBa0NoQixDQUFDO1FBN0JHLGlDQUFjLEdBQWQsVUFBZSxLQUFZO1lBQ3ZCLElBQUksQ0FBQyxhQUFhLEdBQUcsS0FBSyxDQUFDO1FBQy9CLENBQUM7UUFDRCxpQ0FBYyxHQUFkO1lBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDOUIsQ0FBQztRQUNELHlCQUFNLEdBQU4sVUFBTyxNQUFnQyxJQUFJLENBQUM7UUFDNUMsNkJBQVUsR0FBVjtZQUNJLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBQztnQkFDcEIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUM3QixDQUFDO1FBQ0wsQ0FBQztRQUNELGlDQUFjLEdBQWQsVUFBZSxTQUFtQjtZQUM5QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsU0FBUyxJQUFJLElBQUksQ0FBQyxDQUFBLENBQUM7Z0JBQ3ZCLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxjQUFjLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDakQsQ0FBQztRQUNMLENBQUM7UUFDTSw4QkFBVyxHQUFsQjtZQUNJLEVBQUUsQ0FBQSxDQUFDLElBQUksQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLENBQUEsQ0FBQztnQkFDcEIsSUFBSSxRQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztnQkFDekIsT0FBTyxRQUFNLENBQUMsTUFBTSxJQUFJLElBQUksRUFDNUIsQ0FBQztvQkFDRyxRQUFNLEdBQUcsUUFBTSxDQUFDLE1BQU0sQ0FBQztnQkFDM0IsQ0FBQztnQkFDRCxNQUFNLENBQUMsUUFBTSxDQUFDO1lBQ2xCLENBQUM7WUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDO1FBQ2hCLENBQUM7UUFDTCxlQUFDO0lBQUQsQ0FuQ0EsQUFtQ0MsSUFBQTtJQW5DWSxhQUFRLFdBbUNwQixDQUFBO0lBRUQ7UUFBK0IsNkJBQVE7UUFFbkM7WUFBQSxZQUNJLGlCQUFPLFNBRVY7WUFERyxLQUFJLENBQUMsUUFBUSxHQUFFLEVBQUUsQ0FBQzs7UUFDdEIsQ0FBQztRQUNELDJCQUFPLEdBQVAsVUFBUSxJQUFhO1lBQ2pCLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pCLElBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ3ZCLENBQUM7UUFFRCxnQ0FBWSxHQUFaLFVBQWEsTUFBK0I7WUFDeEMsR0FBRyxDQUFBLENBQWEsVUFBYSxFQUFiLEtBQUEsSUFBSSxDQUFDLFFBQVEsRUFBYixjQUFhLEVBQWIsSUFBYTtnQkFBekIsSUFBSSxJQUFJLFNBQUE7Z0JBQ1IsSUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQztnQkFDaEMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLENBQUM7YUFDL0I7UUFDTCxDQUFDO1FBQ0QsNkJBQVMsR0FBVCxVQUFVLE1BQWdDLEVBQUUsSUFBYztZQUN0RCxxQkFBcUI7WUFDckIsOEZBQThGO1lBQzlGLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDO2dCQUMzRCxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2QsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLElBQUksY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7b0JBQ3JELElBQUksQ0FBQyxTQUFTLENBQUMsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM5QyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDO2dCQUNwRCxDQUFDO2dCQUNELElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDO2dCQUM5RixJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNwQixFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksU0FBUyxDQUFDLENBQUMsQ0FBQztvQkFDNUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDOUIsQ0FBQztnQkFDRCxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDckIsQ0FBQztZQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNKLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLElBQUksSUFBSSxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsY0FBYyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxJQUFJLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUN4RyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxjQUFjLENBQUMsR0FBRyxDQUFDO29CQUMxQyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQ2hELENBQUM7Z0JBQ0QsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDcEIsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLFNBQVMsQ0FBQyxDQUFDLENBQUM7b0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLENBQUM7WUFDTCxDQUFDO1FBQ0wsQ0FBQztRQUNMLGdCQUFDO0lBQUQsQ0EzQ0EsQUEyQ0MsQ0EzQzhCLFFBQVEsR0EyQ3RDO0lBM0NZLGNBQVMsWUEyQ3JCLENBQUE7SUFHRDtRQUE4Qiw0QkFBUztRQUF2Qzs7UUFtREEsQ0FBQztRQTlDVSxpQ0FBYyxHQUFyQixVQUFzQixTQUFvQjtZQUN0QyxJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztZQUMzQixzQ0FBc0M7WUFDdEMsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzNCLENBQUM7UUFFTyxrQ0FBZSxHQUF2QjtZQUNJLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNsQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDckUsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLGNBQWMsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO29CQUM1RyxJQUFJLENBQUMsY0FBYyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQztnQkFDOUcsQ0FBQztZQUNMLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixJQUFJLENBQUMsY0FBYyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ3JDLE1BQU0sQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUN2RCxPQUFPLENBQUMsR0FBRyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7WUFDeEQsQ0FBQztRQUVMLENBQUM7UUFDTywyQkFBUSxHQUFoQjtZQUNJLHlDQUF5QztZQUN6QyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxJQUFJLElBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQztnQkFDckUsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO2dCQUNsQixNQUFNLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUMzRCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ0osSUFBSSxDQUFDLGNBQWMsR0FBRyxJQUFJLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUN0QixDQUFDO1FBQ0wsQ0FBQztRQUNELHlCQUFNLEdBQU4sVUFBTyxPQUFtQjtZQUN0QixJQUFJLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQztZQUN4QixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLEtBQUssRUFBQyxPQUFPLENBQUMsV0FBVyxFQUFDLE1BQU0sRUFBQyxPQUFPLENBQUMsWUFBWSxFQUFDLENBQUM7WUFDN0UsSUFBSSxhQUFhLEdBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsUUFBUSxDQUFDLFdBQVcsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUN6QyxJQUFJLENBQUMsT0FBTyxHQUFFLGFBQWEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDN0MsYUFBYSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUN2QyxhQUFhLENBQUMsTUFBTSxHQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1lBQ3hDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQztZQUNsRCxhQUFhLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBQyxJQUFJLENBQUM7UUFHeEQsQ0FBQztRQUNELDZCQUFVLEdBQVY7WUFDSSxJQUFJLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JGLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ3BDLENBQUM7UUFDTCxlQUFDO0lBQUQsQ0FuREEsQUFtREMsQ0FuRDZCLFNBQVMsR0FtRHRDO0lBbkRZLGFBQVEsV0FtRHBCLENBQUE7SUFFRCxJQUFZLGNBSVg7SUFKRCxXQUFZLGNBQWM7UUFDdEIsaUVBQVcsQ0FBQTtRQUNYLDZEQUFTLENBQUE7UUFDVCxpREFBRyxDQUFBO0lBQ1AsQ0FBQyxFQUpXLGNBQWMsR0FBZCxtQkFBYyxLQUFkLG1CQUFjLFFBSXpCO0lBRUQ7UUFBQTtRQUlBLENBQUM7UUFIVSw0QkFBSSxHQUFYLFVBQVksQ0FBUztZQUNqQixNQUFNLENBQUMsQ0FBQyxDQUFDO1FBQ2IsQ0FBQztRQUNMLG9CQUFDO0lBQUQsQ0FKQSxBQUlDLElBQUE7SUFKWSxrQkFBYSxnQkFJekIsQ0FBQTtJQUVEO1FBT0k7WUFOQSxhQUFRLEdBQVcsQ0FBQyxDQUFDO1lBT2pCLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxhQUFhLEVBQUUsQ0FBQztZQUNoQyxJQUFJLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztZQUNmLElBQUksQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDO1lBQ2xCLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO1lBQ2QsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7WUFDWixJQUFJLENBQUMsS0FBSyxHQUFHLGNBQWMsQ0FBQyxXQUFXLENBQUM7UUFDNUMsQ0FBQztRQUVELHNCQUFJLHFDQUFjO2lCQUFsQjtnQkFDSSxJQUFJLEdBQUcsR0FBRSxJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO2dCQUNqRCxnSEFBZ0g7Z0JBQ2hILE1BQU0sQ0FBQyxHQUFHLENBQUM7WUFDZixDQUFDOzs7V0FBQTtRQUNELG9DQUFnQixHQUFoQixVQUFpQixNQUFnQyxFQUFFLElBQWM7UUFDakUsQ0FBQztRQUNELGtDQUFjLEdBQWQsVUFBZSxNQUFnQyxFQUFFLElBQWM7UUFDL0QsQ0FBQztRQUNELHlDQUFxQixHQUFyQixVQUFzQixNQUErQixFQUFDLElBQWEsSUFBRSxDQUFDO1FBRXRFLHlCQUFLLEdBQUwsVUFBTSxHQUFXO1lBQ2IsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUQsQ0FBQztRQUNELHVDQUFtQixHQUFuQixVQUFvQixnQkFBd0IsRUFBRSxNQUFnQyxFQUFFLElBQWM7UUFDOUYsQ0FBQztRQUNMLGdCQUFDO0lBQUQsQ0FoQ0EsQUFnQ0MsSUFBQTtJQWhDWSxjQUFTLFlBZ0NyQixDQUFBO0FBQ0wsQ0FBQyxFQXZMUyxJQUFJLEtBQUosSUFBSSxRQXVMYjtBQ3ZMRCxrQ0FBa0M7QUFFbEMsSUFBVSxJQUFJLENBMGlCYjtBQTFpQkQsV0FBVSxJQUFJO0lBQ1YsWUFBWSxDQUFDO0lBQ2IsSUFBTSxLQUFLLEdBQWEsQ0FBQyxvQkFBb0IsRUFBRSxvQkFBb0IsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDO0lBRXhLO1FBRUksZUFBWSxDQUFVLEVBQUUsQ0FBVTtZQURsQyxNQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQUMsTUFBQyxHQUFHLENBQUMsQ0FBQztZQUVULEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNaLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQztZQUNELEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNaLElBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1lBQ2YsQ0FBQztRQUNMLENBQUM7UUFDTCxZQUFDO0lBQUQsQ0FWQSxBQVVDLElBQUE7SUFWWSxVQUFLLFFBVWpCLENBQUE7SUFFRDtRQUF1QyxxQ0FBUTtRQU0zQywyQkFBWSxFQUFVLEVBQUUsRUFBVSxFQUFFLEtBQWEsRUFBRSxNQUFjO1lBQWpFLFlBQ0ksaUJBQU8sU0F1QlY7WUF6Qk0sV0FBSyxHQUFXLENBQUMsQ0FBQztZQUdyQixJQUFJLEVBQUUsR0FBYSxFQUFFLEVBQUUsRUFBRSxHQUFhLEVBQUUsQ0FBQztZQUN6QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ1gsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNYLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDdEMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDMUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNkLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsTUFBTSxDQUFDO1lBQ3BCLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDZCxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sR0FBRSxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUMsRUFBRSxDQUFDO1lBQ3pDLElBQUksT0FBTyxHQUFVLElBQUksS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM3QyxJQUFJLEtBQUssR0FBVSxJQUFJLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsSUFBSSxNQUFNLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1lBQ2hDLElBQUksTUFBTSxHQUFtQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDaEUsS0FBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsRUFBRSxDQUFDO1lBQ3BCLEtBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLEVBQUUsQ0FBQztZQUNwQixJQUFJLE1BQU0sR0FBYSxFQUFFLENBQUM7WUFDMUIsSUFBSSxNQUFNLEdBQWEsRUFBRSxDQUFDO1lBQzFCLEtBQUksQ0FBQyxFQUFFLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7WUFDakMsS0FBSSxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNqQyxLQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNuQixLQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQzs7UUFFdkIsQ0FBQztRQUVELGtDQUFNLEdBQU4sVUFBTyxNQUFnQztZQUNuQyxpQkFBTSxNQUFNLFlBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBLGtDQUFrQztZQUU5RCxJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7WUFDdkIsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7WUFFL0IsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLFdBQVcsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQ2hDLE1BQU0sQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDL0MsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQ25GLElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUM7WUFDdEIsSUFBSSxPQUFPLEdBQVcsQ0FBQyxDQUFDO1lBQ3hCLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDNUMsT0FBTyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7Z0JBQzVDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3pCLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDZCxJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxDQUFDLEdBQVcsS0FBSyxDQUFDO2dCQUN0QixFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztvQkFDL0IsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUM3QixLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7b0JBQzdCLENBQUMsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ3pDLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2QsQ0FBQztnQkFDRCxJQUFJLE9BQU8sR0FBRyxPQUFPLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQTtnQkFDbkMsSUFBSSxPQUFPLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BDLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDOUIsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUM5QixRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUN0QyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUN0QyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUM7Z0JBQ2hELFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDaEQsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO2dCQUM1QyxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7WUFDaEQsQ0FBQztZQUNELE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBQyxHQUFHLENBQUMsRUFBRSxHQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLEdBQUMsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxHQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBRUQsaUJBQWlCO1lBQ2pCLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUNMLHdCQUFDO0lBQUQsQ0FwRkEsQUFvRkMsQ0FwRnNDLEtBQUEsUUFBUSxHQW9GOUM7SUFwRlksc0JBQWlCLG9CQW9GN0IsQ0FBQTtJQUVEO1FBQXdDLHNDQUFRO1FBTTVDLDRCQUFZLEVBQVUsRUFBRSxFQUFVLEVBQUUsS0FBYSxFQUFFLE1BQWM7WUFBakUsWUFDSSxpQkFBTyxTQXVCVjtZQXpCTSxXQUFLLEdBQVcsQ0FBQyxDQUFDO1lBSXJCLG1CQUFtQjtZQUNuQixtQkFBbUI7WUFDbkIsS0FBSSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUM7WUFDYixLQUFJLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUViLGFBQWE7WUFDYixhQUFhO1lBQ2IsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxNQUFNLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLE1BQU0sR0FBRyxFQUFFLENBQUM7WUFDM0UsSUFBSSxFQUFFLEdBQVcsRUFBRSxHQUFHLEVBQUUsQ0FBQztZQUN6QixJQUFJLEVBQUUsR0FBVyxFQUFFLEdBQUcsRUFBRSxDQUFDO1lBQ3pCLElBQUksSUFBSSxHQUFXLEdBQUcsQ0FBQztZQUN2QixJQUFJLEtBQUssR0FBVyxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzlCLElBQUksS0FBSyxHQUFXLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFDOUIsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDNUIsS0FBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztnQkFDN0IsS0FBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQztZQUNqQyxDQUFDO1lBQ0QsS0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbkIsS0FBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7O1FBRXZCLENBQUM7UUFFRCxtQ0FBTSxHQUFOLFVBQU8sTUFBZ0M7WUFDbkMsaUJBQU0sTUFBTSxZQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3JCLElBQUksS0FBSyxHQUFXLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQSxrQ0FBa0M7WUFFOUQsSUFBSSxNQUFNLEdBQVcsQ0FBQyxDQUFDO1lBQ3ZCLElBQUksR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO1lBRS9CLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxXQUFXLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNoQyxNQUFNLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9DLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUNuRixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxRQUFRLEdBQUcsRUFBRSxDQUFDO1lBQ2xCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUM7WUFDdEIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksT0FBTyxHQUFXLENBQUMsQ0FBQztZQUN4QixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7Z0JBQzVDLE9BQU8sR0FBRyxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO2dCQUM1QyxJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUN6QixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7Z0JBQ2QsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLElBQUksQ0FBQyxHQUFXLEtBQUssQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7b0JBQy9CLEtBQUssR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztvQkFDN0IsS0FBSyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO29CQUM3QixDQUFDLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUN6QyxLQUFLLEdBQUcsQ0FBQyxDQUFDO2dCQUNkLENBQUM7Z0JBQ0QsSUFBSSxPQUFPLEdBQUcsT0FBTyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7Z0JBQ25DLElBQUksT0FBTyxHQUFHLE9BQU8sR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNwQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUM7Z0JBQzlCLFFBQVEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDOUIsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDdEMsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxHQUFHLE9BQU8sQ0FBQztnQkFDdEMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxLQUFLLEdBQUcsT0FBTyxDQUFDO2dCQUNoRCxRQUFRLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLEtBQUssR0FBRyxPQUFPLENBQUM7Z0JBQ2hELFFBQVEsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDNUMsUUFBUSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsT0FBTyxDQUFDO1lBQ2hELENBQUM7WUFDRCxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN4QyxHQUFHLENBQUMsQ0FBQyxJQUFJLEdBQUMsR0FBRyxDQUFDLEVBQUUsR0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsRUFBRSxHQUFDLEVBQUUsQ0FBQztnQkFDdkMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsR0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUM7WUFDNUMsQ0FBQztZQUNELE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUNkLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUNuQixNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7UUFDckIsQ0FBQztRQUNMLHlCQUFDO0lBQUQsQ0FsRkEsQUFrRkMsQ0FsRnVDLEtBQUEsUUFBUSxHQWtGL0M7SUFsRlksdUJBQWtCLHFCQWtGOUIsQ0FBQTtJQUNEO1FBQW1DLGlDQUFTO1FBR3hDO1lBQUEsWUFDSSxpQkFBTyxTQUVWO1lBREcsS0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLEtBQUEsYUFBYSxFQUFFLENBQUM7O1FBQ3BDLENBQUM7UUFFRCwyQ0FBbUIsR0FBbkIsVUFBb0IsZ0JBQXdCLEVBQUUsTUFBZ0MsRUFBRSxJQUFjO1lBQzFGLElBQUksS0FBSyxHQUFXLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztZQUV6RSxJQUFJLEtBQUssR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUM7WUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLGlCQUFpQixJQUFJLElBQUksWUFBWSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxHQUFHLENBQUM7Z0JBQzdCLElBQUksSUFBSSxHQUFXLEVBQUUsQ0FBQztnQkFDdEIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO29CQUNwQyxJQUFJLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEdBQUcsS0FBSyxHQUFHLENBQUMsQ0FBQztnQkFDdEMsQ0FBQztnQkFDRCxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUM7Z0JBQ25ELElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQztZQUN2RCxDQUFDO1FBQ0wsQ0FBQztRQUNELHdDQUFnQixHQUFoQixVQUFpQixNQUFnQyxFQUFFLElBQWM7WUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLGlCQUFpQixJQUFJLElBQUksWUFBWSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQzFFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQzNCLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDL0IsQ0FBQztRQUVMLENBQUM7UUFDRCxzQ0FBYyxHQUFkLFVBQWUsTUFBZ0MsRUFBRSxJQUFjO1lBQzNELEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxpQkFBaUIsSUFBSSxJQUFJLFlBQVksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUMxRSxJQUFJLENBQUMsUUFBUSxHQUFHLEVBQUUsQ0FBQztnQkFDbkIsSUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDdkIsQ0FBQztRQUNMLENBQUM7UUFDTCxvQkFBQztJQUFELENBbkNBLEFBbUNDLENBbkNrQyxLQUFBLFNBQVMsR0FtQzNDO0lBbkNZLGtCQUFhLGdCQW1DekIsQ0FBQTtJQUVEO1FBQXdDLHNDQUFTO1FBTTdDO21CQUNJLGlCQUFPO1FBQ1gsQ0FBQztRQUVELG1DQUFNLEdBQU4sVUFBTyxNQUFnQztZQUNuQyxpQkFBTSxNQUFNLFlBQUMsTUFBTSxDQUFDLENBQUM7WUFDckIsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLElBQUksSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxNQUFNLENBQUM7WUFDWCxDQUFDO1lBQ0QsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLEVBQUUsQ0FBQztZQUM1QixJQUFJLE1BQU0sR0FBVyxDQUFDLENBQUM7WUFDdkIsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUMvQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7WUFDbkIsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9ELElBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztZQUNsQixJQUFJLFFBQVEsR0FBRyxFQUFFLENBQUM7WUFDbEIsSUFBSSxLQUFLLEdBQVcsQ0FBQyxDQUFDO1lBQ3RCLElBQUksS0FBSyxHQUFXLENBQUMsQ0FBQztZQUN0QixJQUFJLEtBQUssR0FBVyxDQUFDLENBQUM7WUFDdEIsSUFBSSxPQUFPLEdBQVcsQ0FBQyxDQUFDO1lBQ3hCLFFBQVEsQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztZQUNwQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQztZQUMzQixRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLE9BQU8sR0FBRyxNQUFNLENBQUM7WUFDcEMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUM7WUFDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1lBQ2pDLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDO2dCQUN2QyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUM1QyxDQUFDO1lBQ0QsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsTUFBTSxDQUFDLFNBQVMsRUFBRSxDQUFDO1lBQ25CLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNyQixDQUFDO1FBQ0wseUJBQUM7SUFBRCxDQXpDQSxBQXlDQyxDQXpDdUMsS0FBQSxTQUFTLEdBeUNoRDtJQXpDWSx1QkFBa0IscUJBeUM5QixDQUFBO0lBRUQ7UUFBbUMsaUNBQVM7UUFHeEM7WUFBQSxZQUNJLGlCQUFPLFNBVVY7WUFURyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsQ0FBQztZQUMzQyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ2pCLEtBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxXQUFXLEVBQUUsQ0FBQztZQUNsQyxDQUFDO1lBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDeEIsS0FBSSxDQUFDLElBQUksR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDO1lBQ2pDLENBQUM7WUFBQyxJQUFJLENBQUMsQ0FBQztnQkFDSixLQUFJLENBQUMsSUFBSSxHQUFHLElBQUksS0FBQSxhQUFhLEVBQUUsQ0FBQztZQUNwQyxDQUFDOztRQUVMLENBQUM7UUFFRCwyQ0FBbUIsR0FBbkIsVUFBb0IsZ0JBQXdCLEVBQUUsTUFBZ0MsRUFBRSxJQUFjO1lBQzFGLElBQUksS0FBSyxHQUFXLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxnQkFBZ0IsQ0FBQztZQUN6RSxFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO2dCQUNyQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQSxzQkFBc0I7Z0JBQzVDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztZQUMzQyxDQUFDO1FBRUwsQ0FBQztRQUNELHdDQUFnQixHQUFoQixVQUFpQixNQUFnQyxFQUFFLElBQWM7WUFDN0QsRUFBRSxDQUFDLENBQUMsSUFBSSxZQUFZLGtCQUFrQixDQUFDLENBQUMsQ0FBQztnQkFDckMsSUFBSSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO2dCQUNoQixJQUFJLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDcEIsQ0FBQztRQUVMLENBQUM7UUFDRCxzQ0FBYyxHQUFkLFVBQWUsTUFBZ0MsRUFBRSxJQUFjO1lBQzNELEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3JDLElBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDLENBQUEsVUFBVTtnQkFDOUIsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsQ0FBQSxTQUFTO1lBQ2pDLENBQUM7UUFDTCxDQUFDO1FBQ0wsb0JBQUM7SUFBRCxDQXJDQSxBQXFDQyxDQXJDa0MsS0FBQSxTQUFTLEdBcUMzQztJQXJDWSxrQkFBYSxnQkFxQ3pCLENBQUE7SUFDRDtRQUFnQyw4QkFBUTtRQUNwQzttQkFDSSxpQkFBTztRQUNYLENBQUM7UUFFRCx5QkFBSSxHQUFKO1lBRUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxFQUFFLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxJQUFJLEdBQVcsR0FBRyxDQUFDO2dCQUN2QixJQUFJLFVBQVUsR0FBVyxDQUFDLENBQUMsQ0FBQSxlQUFlO2dCQUMxQyxJQUFJLFFBQVEsR0FBVyxHQUFHLENBQUMsQ0FBQSxpQkFBaUI7Z0JBQzVDLElBQUksT0FBTyxHQUFXLEdBQUcsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxHQUFHLEdBQUcsQ0FBQztnQkFDdEQsSUFBSSxPQUFPLEdBQVcsR0FBRyxDQUFDO2dCQUMxQixJQUFJLE1BQU0sR0FBVyxHQUFHLENBQUM7Z0JBQ3pCLElBQUksa0JBQWtCLEdBQXVCLElBQUksa0JBQWtCLEVBQUUsQ0FBQztnQkFDdEUsa0JBQWtCLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDM0Isa0JBQWtCLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztnQkFDL0Isa0JBQWtCLENBQUMsQ0FBQyxHQUFHLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7Z0JBQ3RELEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7b0JBQzVCLElBQUksS0FBSyxHQUFXLENBQUMsVUFBVSxHQUFHLENBQUMsUUFBUSxHQUFHLFVBQVUsQ0FBQyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLEdBQUcsQ0FBQztvQkFDdEYsSUFBSSxFQUFFLEdBQWEsRUFBRSxDQUFDO29CQUN0QixJQUFJLEVBQUUsR0FBYSxFQUFFLENBQUM7b0JBQ3RCLElBQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxDQUFBLHVCQUF1QjtvQkFDeEMsSUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUEsdUJBQXVCO29CQUN4QyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ2IsSUFBSSxJQUFJLEdBQXVCLElBQUksa0JBQWtCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxHQUFHLENBQUMsQ0FBQzt3QkFFbkcsOEVBQThFO3dCQUM5RSxJQUFJLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO3dCQUMxQyxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7b0JBQ3JDLENBQUM7b0JBQUMsSUFBSSxDQUFDLENBQUM7d0JBQ0osSUFBSSxJQUFJLEdBQXNCLElBQUksaUJBQWlCLENBQUMsRUFBRSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7d0JBQzNFLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7d0JBQzFDLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztvQkFDckMsQ0FBQztnQkFDTCxDQUFDO2dCQUNELElBQUksQ0FBQyxPQUFPLENBQUMsa0JBQWtCLENBQUMsQ0FBQztnQkFDakMsa0JBQWtCLENBQUMsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDO1lBQzVELENBQUM7UUFDTCxDQUFDO1FBR0Qsa0NBQWEsR0FBYjtZQUNJLElBQUksS0FBSyxHQUFVLENBQUMsQ0FBQTtvQ0FDWCxJQUFJO2dCQUNULEtBQUssRUFBRSxDQUFDO2dCQUNSLFVBQVUsQ0FBQztvQkFDUCxFQUFFLENBQUMsQ0FBQyxJQUFJLFlBQVksa0JBQWtCLENBQUMsQ0FBQyxDQUFDO3dCQUNyQyxJQUFJLG9CQUFrQixHQUF1QixJQUFJLENBQUM7d0JBQ2xELElBQUksVUFBVSxHQUFrQixJQUFJLGFBQWEsRUFBRSxDQUFDO3dCQUNwRCxVQUFVLENBQUMsUUFBUSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDO3dCQUNsRCxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQzt3QkFDcEIsVUFBVSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUM7d0JBQ2xCLG9CQUFrQixDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQzt3QkFDOUMsSUFBSSxpQkFBZSxHQUFHLFVBQVUsQ0FBQyxjQUFjLENBQUM7d0JBQ2hELFVBQVUsQ0FBQyxjQUFjLEdBQUcsVUFBQyxNQUFnQyxFQUFFLElBQWM7NEJBQ3pFLGlCQUFlLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxDQUFDOzRCQUM5QixHQUFHLENBQUMsQ0FBYSxVQUEyQixFQUEzQixLQUFBLG9CQUFrQixDQUFDLFFBQVEsRUFBM0IsY0FBMkIsRUFBM0IsSUFBMkI7Z0NBQXZDLElBQUksTUFBSSxTQUFBO2dDQUNULElBQUksU0FBUyxHQUFHLElBQUksYUFBYSxFQUFFLENBQUM7Z0NBQ3BDLFNBQVMsQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksR0FBRyxJQUFJLENBQUM7Z0NBQ2pELFNBQVMsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDO2dDQUNuQixTQUFTLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztnQ0FDakIsTUFBSSxDQUFDLGNBQWMsQ0FBQyxTQUFTLENBQUMsQ0FBQzs2QkFDbEM7d0JBQ0wsQ0FBQyxDQUFBO29CQUNMLENBQUM7Z0JBQ0wsQ0FBQyxFQUFFLEtBQUssR0FBQyxDQUFDLElBQUksR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztZQUN4QyxDQUFDO1lBdkJELEdBQUcsQ0FBQyxDQUFhLFVBQWEsRUFBYixLQUFBLElBQUksQ0FBQyxRQUFRLEVBQWIsY0FBYSxFQUFiLElBQWE7Z0JBQXpCLElBQUksSUFBSSxTQUFBO3dCQUFKLElBQUk7YUF1Qlo7UUFFTCxDQUFDO1FBQ0wsaUJBQUM7SUFBRCxDQXRFQSxBQXNFQyxDQXRFK0IsS0FBQSxRQUFRLEdBc0V2QztJQXRFWSxlQUFVLGFBc0V0QixDQUFBO0lBR0Q7UUE4QkksZ0JBQVksQ0FBVyxFQUFFLENBQVc7WUE3QnBDLEdBQUc7WUFDSyxNQUFDLEdBQUcsS0FBSyxDQUFDO1lBS1YsT0FBRSxHQUFZLEVBQUUsQ0FBQztZQUNqQixPQUFFLEdBQVksRUFBRSxDQUFDO1lBQ2pCLE9BQUUsR0FBWSxFQUFFLENBQUM7WUFDakIsT0FBRSxHQUFZLEVBQUUsQ0FBQztZQUl6Qix1Q0FBdUM7WUFDdkMsc0NBQXNDO1lBQ3RDLHdDQUF3QztZQUN4QyxvQ0FBb0M7WUFFNUIsTUFBQyxHQUFHO2dCQUNSLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDO2dCQUN4QyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUM7Z0JBQzFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2FBS3RCLENBQUM7WUFHRSxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNaLElBQUksQ0FBQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1lBRVosSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRW5ELEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNWLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO29CQUMvQixJQUFJLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDMUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUMvQixJQUFJLEVBQUUsR0FBRyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDdkMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDLElBQUksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBRXhGLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7b0JBQ3BCLElBQUksQ0FBQyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7b0JBRXBCLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUYsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVGLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUU1RixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDNUYsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzVGLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUM1RixDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFNUYsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQ2hCLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO29CQUNoQixJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFDaEIsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3BCLENBQUM7WUFD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QUFHLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUM3RixDQUFDO1FBRUwsYUFBQztJQUFELENBM0NBLEFBMkNDLElBQUE7SUEzQ1ksV0FBTSxTQTJDbEIsQ0FBQTtBQUlMLENBQUMsRUExaUJTLElBQUksS0FBSixJQUFJLFFBMGlCYiIsImZpbGUiOiJmaXJld29ya2RzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibmFtZXNwYWNlIHRlc3Qge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICBleHBvcnQgY2xhc3MgQmFzZVZpZXcge1xuICAgICAgICBpZDpudW1iZXI9MDtcbiAgICAgICAgYW5pbWF0aW9uOiBBbmltYXRpb247XG4gICAgICAgIHBhcmVudDpWaWV3R3JvdXA7XG4gICAgICAgIHByb3RlY3RlZCBfY2FudmFzOkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICAgICAgcHJpdmF0ZSBfX2RyYXdpbmdUaW1lOm51bWJlcjtcbiAgICAgICAgc2V0RHJhd2luZ1RpbWUodmFsdWU6bnVtYmVyKXtcbiAgICAgICAgICAgIHRoaXMuX19kcmF3aW5nVGltZSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIGdldERyYXdpbmdUaW1lKCk6bnVtYmVye1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX19kcmF3aW5nVGltZTtcbiAgICAgICAgfVxuICAgICAgICBvbkRyYXcoY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpIHsgfVxuICAgICAgICBpbnZhbGlkYXRlKCk6dm9pZHtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyZW50ICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LmludmFsaWRhdGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzdGFydEFuaW1hdGlvbihhbmltYXRpb246QW5pbWF0aW9uKXtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uID0gYW5pbWF0aW9uO1xuICAgICAgICAgICAgaWYodGhpcy5hbmltYXRpb24gIT0gbnVsbCl7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRSb290VmlldygpLnN0YXJ0QW5pbWF0aW9uKGFuaW1hdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcHVibGljIGdldFJvb3RWaWV3KCk6IEJhc2VWaWV3IHtcbiAgICAgICAgICAgIGlmKHRoaXMucGFyZW50ICE9IG51bGwpe1xuICAgICAgICAgICAgICAgIGxldCBwYXJlbnQgPSB0aGlzLnBhcmVudDtcbiAgICAgICAgICAgICAgICB3aGlsZSAocGFyZW50LnBhcmVudCAhPSBudWxsKVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcGFyZW50ID0gcGFyZW50LnBhcmVudDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG4gICAgfVxuICAgIFxuICAgIGV4cG9ydCBjbGFzcyBWaWV3R3JvdXAgZXh0ZW5kcyBCYXNlVmlldyB7XG4gICAgICAgIGNoaWxkcmVuOiBCYXNlVmlld1tdO1xuICAgICAgICBjb25zdHJ1Y3Rvcigpe1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuY2hpbGRyZW4gPVtdO1xuICAgICAgICB9XG4gICAgICAgIGFkZFZpZXcodmlldzpCYXNlVmlldyl7XG4gICAgICAgICAgICB0aGlzLmNoaWxkcmVuLnB1c2godmlldyk7XG4gICAgICAgICAgICB2aWV3LnBhcmVudCA9IHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBkaXNwYXRjaERyYXcoY2FudmFzOkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCl7XG4gICAgICAgICAgICBmb3IobGV0IHZpZXcgb2YgdGhpcy5jaGlsZHJlbil7XG4gICAgICAgICAgICAgICAgdmlldy5zZXREcmF3aW5nVGltZShEYXRlLm5vdygpKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRyYXdjaGlsZChjYW52YXMsdmlldyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZHJhd2NoaWxkKGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB2aWV3OiBCYXNlVmlldykge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2codGhpcyk7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcIiAgICBcIiArICh2aWV3LmFuaW1hdGlvbiAhPSBudWxsICkrXCIgLFwiKTsvLysoICF2aWV3LmFuaW1hdGlvbi5pc0FuaWFtdGlvbkVuZCkpO1xuICAgICAgICAgICAgaWYgKHZpZXcuYW5pbWF0aW9uICE9IG51bGwgJiYgIXZpZXcuYW5pbWF0aW9uLmlzQW5pYW10aW9uRW5kKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLnNhdmUoKTtcbiAgICAgICAgICAgICAgICBpZiAodmlldy5hbmltYXRpb24uc3RhdGUgPT0gQW5pbWF0aW9uU3RhdGUuQmVmb3JlU3RhcnQpIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5hbmltYXRpb24ub25TdGFydEFuaW1hdGlvbihjYW52YXMsIHZpZXcpO1xuICAgICAgICAgICAgICAgICAgICB2aWV3LmFuaW1hdGlvbi5zdGF0ZSA9IEFuaW1hdGlvblN0YXRlLkFuaW1hdGluZztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmlldy5hbmltYXRpb24uYXBwbHlUcmFuc2Zvcm1hdGlvbih2aWV3LmFuaW1hdGlvbi5zY2FsZSh2aWV3LmdldERyYXdpbmdUaW1lKCkpLCBjYW52YXMsIHZpZXcpO1xuICAgICAgICAgICAgICAgIHZpZXcub25EcmF3KGNhbnZhcyk7XG4gICAgICAgICAgICAgICAgaWYgKHZpZXcgaW5zdGFuY2VvZiBWaWV3R3JvdXApIHtcbiAgICAgICAgICAgICAgICAgICAgdmlldy5kaXNwYXRjaERyYXcoY2FudmFzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FudmFzLnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHZpZXcuYW5pbWF0aW9uICE9IG51bGwgJiYgdmlldy5hbmltYXRpb24uaXNBbmlhbXRpb25FbmQgJiYgdmlldy5hbmltYXRpb24uc3RhdGUgIT0gQW5pbWF0aW9uU3RhdGUuRW5kKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcuYW5pbWF0aW9uLnN0YXRlID0gQW5pbWF0aW9uU3RhdGUuRW5kO1xuICAgICAgICAgICAgICAgICAgICB2aWV3LmFuaW1hdGlvbi5vbkVuZEFuaW1hdGlvbihjYW52YXMsIHZpZXcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3Lm9uRHJhdyhjYW52YXMpO1xuICAgICAgICAgICAgICAgIGlmICh2aWV3IGluc3RhbmNlb2YgVmlld0dyb3VwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZXcuZGlzcGF0Y2hEcmF3KGNhbnZhcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBleHBvcnQgY2xhc3MgUm9vdFZpZXcgZXh0ZW5kcyBWaWV3R3JvdXB7XG4gICAgICAgIHByaXZhdGUgX3JlY3Q6e2w6bnVtYmVyLHQ6bnVtYmVyLHdpZHRoOm51bWJlcixoZWlnaHQ6bnVtYmVyfTtcbiAgICAgICAgcHJpdmF0ZSBfcm9vdEFuaWFtdGlvbjpBbmltYXRpb247XG4gICAgICAgIHByaXZhdGUgX2VsZW1lbnQ6SFRNTEVsZW1lbnQ7XG5cbiAgICAgICAgcHVibGljIHN0YXJ0QW5pbWF0aW9uKGFuaW1hdGlvbjogQW5pbWF0aW9uKSB7XG4gICAgICAgICAgICB0aGlzLmFuaW1hdGlvbiA9IGFuaW1hdGlvbjtcbiAgICAgICAgICAgIC8vIHNldFRpbWVvdXQodGhpcy5fc3RhcnRBbmltYXRpb24oKSk7XG4gICAgICAgICAgICB0aGlzLl9zdGFydEFuaW1hdGlvbigpO1xuICAgICAgICB9XG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIF9zdGFydEFuaW1hdGlvbigpOiB2b2lkIHtcbiAgICAgICAgICAgIHRoaXMuYW5pbWF0aW9uLnN0YXJ0ID0gRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9yb290QW5pYW10aW9uICE9IG51bGwgJiYgIXRoaXMuX3Jvb3RBbmlhbXRpb24uaXNBbmlhbXRpb25FbmQpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fcm9vdEFuaWFtdGlvbi5kdXJhdGlvbiArIHRoaXMuX3Jvb3RBbmlhbXRpb24uc3RhcnQgPCB0aGlzLmFuaW1hdGlvbi5kdXJhdGlvbiArIHRoaXMuYW5pbWF0aW9uLnN0YXJ0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3Jvb3RBbmlhbXRpb24uZHVyYXRpb24gPSB0aGlzLmFuaW1hdGlvbi5zdGFydCArIHRoaXMuYW5pbWF0aW9uLmR1cmF0aW9uIC0gdGhpcy5fcm9vdEFuaWFtdGlvbi5zdGFydDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3Jvb3RBbmlhbXRpb24gPSB0aGlzLmFuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRoaXMuX2FuaW1hdGUuYmluZCh0aGlzKSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJyZXF1ZXN0QW5pbWF0aW9uRnJhbWUgPT09PT09ID4+Pj4+ICBcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBwcml2YXRlIF9hbmltYXRlKCkge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJfYW5pbWF0aW5nID09PT09PT09PSA+XCIpO1xuICAgICAgICAgICAgaWYgKHRoaXMuX3Jvb3RBbmlhbXRpb24gIT0gbnVsbCAmJiAhdGhpcy5fcm9vdEFuaWFtdGlvbi5pc0FuaWFtdGlvbkVuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaW52YWxpZGF0ZSgpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhpcy5fYW5pbWF0ZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcm9vdEFuaWFtdGlvbiA9IG51bGw7XG4gICAgICAgICAgICAgICAgdGhpcy5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYXR0YWNoKGVsZW1lbnQ6SFRNTEVsZW1lbnQpe1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB0aGlzLl9yZWN0ID0ge2w6MCx0OjAsd2lkdGg6ZWxlbWVudC5jbGllbnRXaWR0aCxoZWlnaHQ6ZWxlbWVudC5jbGllbnRIZWlnaHR9O1xuICAgICAgICAgICAgbGV0IGNhbnZhc0VsZW1lbnQgPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgICAgdGhpcy5fZWxlbWVudC5hcHBlbmRDaGlsZChjYW52YXNFbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuX2NhbnZhcyA9Y2FudmFzRWxlbWVudC5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICAgICAgY2FudmFzRWxlbWVudC53aWR0aCA9IHRoaXMuX3JlY3Qud2lkdGg7XG4gICAgICAgICAgICBjYW52YXNFbGVtZW50LmhlaWdodCA9dGhpcy5fcmVjdC5oZWlnaHQ7XG4gICAgICAgICAgICBjYW52YXNFbGVtZW50LnN0eWxlLndpZHRoID0gdGhpcy5fcmVjdC53aWR0aCtcInB4XCI7XG4gICAgICAgICAgICBjYW52YXNFbGVtZW50LnN0eWxlLmhlaWdodCA9IHRoaXMuX3JlY3QuaGVpZ2h0K1wicHhcIjtcblxuXG4gICAgICAgIH1cbiAgICAgICAgaW52YWxpZGF0ZSgpe1xuICAgICAgICAgICAgdGhpcy5fY2FudmFzLmNsZWFyUmVjdCh0aGlzLl9yZWN0LmwsdGhpcy5fcmVjdC50LHRoaXMuX3JlY3Qud2lkdGgsdGhpcy5fcmVjdC5oZWlnaHQpO1xuICAgICAgICAgICAgdGhpcy5kaXNwYXRjaERyYXcodGhpcy5fY2FudmFzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBlbnVtIEFuaW1hdGlvblN0YXRlIHtcbiAgICAgICAgQmVmb3JlU3RhcnQsXG4gICAgICAgIEFuaW1hdGluZyxcbiAgICAgICAgRW5kXG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbkVhc2Uge1xuICAgICAgICBwdWJsaWMgZWFzZSh0OiBudW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiB0O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZXhwb3J0IGNsYXNzIEFuaW1hdGlvbiB7XG4gICAgICAgIGR1cmF0aW9uOiBudW1iZXIgPSAwO1xuICAgICAgICBzdGFydDogbnVtYmVyO1xuICAgICAgICBlYXNlOiBBbmltYXRpb25FYXNlO1xuICAgICAgICBmcm9tOiBudW1iZXI7XG4gICAgICAgIHRvOiBudW1iZXI7XG4gICAgICAgIHN0YXRlOiBBbmltYXRpb25TdGF0ZTtcbiAgICAgICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgICAgICB0aGlzLmVhc2UgPSBuZXcgQW5pbWF0aW9uRWFzZSgpO1xuICAgICAgICAgICAgdGhpcy5zdGFydCA9IDA7XG4gICAgICAgICAgICB0aGlzLmR1cmF0aW9uID0gMDtcbiAgICAgICAgICAgIHRoaXMuZnJvbSA9IDE7XG4gICAgICAgICAgICB0aGlzLnRvID0gMTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBBbmltYXRpb25TdGF0ZS5CZWZvcmVTdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldCBpc0FuaWFtdGlvbkVuZCgpOiBib29sZWFuIHtcbiAgICAgICAgICAgIGxldCBmbGc9IHRoaXMuc3RhcnQgKyB0aGlzLmR1cmF0aW9uIDwgRGF0ZS5ub3coKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiaXNBbmltYXRpb25FbmQgIFwiICsgdGhpcy5zdGFydCArIFwiIGR1cmF0aW9uIFwiICt0aGlzLmR1cmF0aW9uICtcIiBub3cgXCIgKyBEYXRlLm5vdygpICArXCIgXCIgICtmbGcpO1xuICAgICAgICAgICAgcmV0dXJuIGZsZztcbiAgICAgICAgfVxuICAgICAgICBvblN0YXJ0QW5pbWF0aW9uKGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB2aWV3OiBCYXNlVmlldykge1xuICAgICAgICB9XG4gICAgICAgIG9uRW5kQW5pbWF0aW9uKGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB2aWV3OiBCYXNlVmlldykge1xuICAgICAgICB9XG4gICAgICAgIF9fb25Jbm5lcmFuaW1hdGlvbkVuZChjYW52YXM6Q2FudmFzUmVuZGVyaW5nQ29udGV4dDJELHZpZXc6QmFzZVZpZXcpe31cbiAgICAgICAgXG4gICAgICAgIHNjYWxlKG5vdzogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVhc2UuZWFzZSgobm93IC0gdGhpcy5zdGFydCkgLyB0aGlzLmR1cmF0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICBhcHBseVRyYW5zZm9ybWF0aW9uKGludGVycG9sYXRlZFRpbWU6IG51bWJlciwgY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHZpZXc6IEJhc2VWaWV3KSB7XG4gICAgICAgIH1cbiAgICB9XG59IiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vQmFzZS50c1wiIC8+XG5cbm5hbWVzcGFjZSB0ZXN0IHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgY29uc3QgQ29sb3I6IHN0cmluZ1tdID0gWydyZ2IoMjUxLCAxMTgsIDEyMyknLCAncmdiKDEyOSwgMjI3LCAyMzgpJywgJyM4OGJkZTYnLCAnI2ZiYjI1OCcsICcjOTBjZDk3JywgJyNmNmFhYzknLCAnI2JmYTU1NCcsICcjYmM5OWM3JywgJyNlZGRkNDYnLCAnI2YwN2U2ZScsICcjOGM4YzhjJ107XG5cbiAgICBleHBvcnQgY2xhc3MgUG9pbnQge1xuICAgICAgICB4ID0gMDsgeSA9IDA7XG4gICAgICAgIGNvbnN0cnVjdG9yKHg/OiBudW1iZXIsIHk/OiBudW1iZXIpIHtcbiAgICAgICAgICAgIGlmICh4ICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHkgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRmlyZVdvcmtzQm9tYlZpZXcgZXh0ZW5kcyBCYXNlVmlldyB7XG4gICAgICAgIHB1YmxpYyB4czogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyB5czogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyByZW5kZXJYczogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyByZW5kZXJZczogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyBhbHBoYTogbnVtYmVyID0gMTtcbiAgICAgICAgY29uc3RydWN0b3IoY3g6IG51bWJlciwgY3k6IG51bWJlciwgYW5nbGU6IG51bWJlciwgcmFkaXVzOiBudW1iZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICBsZXQgeHM6IG51bWJlcltdID0gW10sIHlzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgeHNbMF0gPSBjeDtcbiAgICAgICAgICAgIHlzWzBdID0gY3k7XG4gICAgICAgICAgICB4c1sxXSA9IE1hdGguY29zKGFuZ2xlKSAqIHJhZGl1cyArIGN4O1xuICAgICAgICAgICAgeXNbMV0gPSBNYXRoLnNpbihNYXRoLnJhbmRvbSgpICogTWF0aC5QSSkgKiBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXMgKyBjeTtcbiAgICAgICAgICAgIHhzWzJdID0geHNbMV07XG4gICAgICAgICAgICB5c1syXSA9IGN5ICsgcmFkaXVzO1xuICAgICAgICAgICAgeHNbM10gPSB4c1syXTtcbiAgICAgICAgICAgIHlzWzNdID0geXNbMl0gKyByYWRpdXMgK01hdGgucmFuZG9tKCkqMjA7XG4gICAgICAgICAgICBsZXQgc3RhcnRQdDogUG9pbnQgPSBuZXcgUG9pbnQoeHNbMF0sIHlzWzBdKTtcbiAgICAgICAgICAgIGxldCBlbmRQdDogUG9pbnQgPSBuZXcgUG9pbnQoeHNbMV0sIHlzWzFdKTtcbiAgICAgICAgICAgIGxldCBzcGxpbmUgPSBuZXcgU3BsaW5lKHhzLCB5cyk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0OiB7IHhzOiBudW1iZXJbXSwgeXM6IG51bWJlcltdIH0gPSBzcGxpbmUuY2FsY3VsYXRlKCk7XG4gICAgICAgICAgICB0aGlzLnhzID0gcmVzdWx0LnhzO1xuICAgICAgICAgICAgdGhpcy55cyA9IHJlc3VsdC55cztcbiAgICAgICAgICAgIGxldCBsaW5leHM6IG51bWJlcltdID0gW107XG4gICAgICAgICAgICBsZXQgbGluZXlzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgdGhpcy54cyA9IGxpbmV4cy5jb25jYXQodGhpcy54cyk7XG4gICAgICAgICAgICB0aGlzLnlzID0gbGluZXlzLmNvbmNhdCh0aGlzLnlzKTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyWHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyWXMgPSBbXTtcblxuICAgICAgICB9XG5cbiAgICAgICAgb25EcmF3KGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEKTogdm9pZCB7XG4gICAgICAgICAgICBzdXBlci5vbkRyYXcoY2FudmFzKTtcbiAgICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gdGhpcy5pZDsvL01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwMCk7XG5cbiAgICAgICAgICAgIGxldCByYWRpdXM6IG51bWJlciA9IDI7XG4gICAgICAgICAgICBsZXQgbGVuID0gdGhpcy5yZW5kZXJZcy5sZW5ndGg7XG5cbiAgICAgICAgICAgIGNhbnZhcy5zYXZlKCk7XG4gICAgICAgICAgICBjYW52YXMuZ2xvYmFsQWxwaGEgPSB0aGlzLmFscGhhO1xuICAgICAgICAgICAgY2FudmFzLmZpbGxTdHlsZSA9IENvbG9yW2luZGV4ICUgQ29sb3IubGVuZ3RoXTtcbiAgICAgICAgICAgIGNhbnZhcy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNhbnZhcy5hcmModGhpcy5yZW5kZXJYc1tsZW4gLSAxXSwgdGhpcy5yZW5kZXJZc1tsZW4gLSAxXSwgcmFkaXVzLCAwLCAyICogTWF0aC5QSSk7XG4gICAgICAgICAgICBsZXQgcmVzdWx0eHMgPSBbXTtcbiAgICAgICAgICAgIGxldCByZXN1bHR5cyA9IFtdO1xuICAgICAgICAgICAgdmFyIG5leHR4OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgdmFyIG5leHR5OiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgdmFyIGxhc3RhOiBudW1iZXIgPSAwO1xuICAgICAgICAgICAgbGV0IHBhZGRpbmc6IG51bWJlciA9IDU7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucmVuZGVyWHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBwYWRkaW5nID0gaSAvIHRoaXMucmVuZGVyWHMubGVuZ3RoICogcmFkaXVzO1xuICAgICAgICAgICAgICAgIHZhciB4ID0gdGhpcy5yZW5kZXJYc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgeSA9IHRoaXMucmVuZGVyWXNbaV07XG4gICAgICAgICAgICAgICAgdmFyIG5leHR4ID0geDtcbiAgICAgICAgICAgICAgICB2YXIgbmV4dHkgPSB5O1xuICAgICAgICAgICAgICAgIHZhciBhOiBudW1iZXIgPSBsYXN0YTtcbiAgICAgICAgICAgICAgICBpZiAoaSArIDEgPCB0aGlzLnJlbmRlclhzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBuZXh0eCA9IHRoaXMucmVuZGVyWHNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICBuZXh0eSA9IHRoaXMucmVuZGVyWXNbaSArIDFdO1xuICAgICAgICAgICAgICAgICAgICBhID0gTWF0aC5hdGFuKChuZXh0eSAtIHkpIC8gKG5leHR4IC0geCkpO1xuICAgICAgICAgICAgICAgICAgICBsYXN0YSA9IGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHZhciB4b2Zmc2V0ID0gcGFkZGluZyAqIE1hdGguc2luKGEpXG4gICAgICAgICAgICAgICAgdmFyIHlvZmZzZXQgPSBwYWRkaW5nICogTWF0aC5jb3MoYSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0eHNbMiAqIGldID0geCArIHhvZmZzZXQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0eXNbMiAqIGldID0geSAtIHlvZmZzZXQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0eHNbMiAqIGkgKyAxXSA9IG5leHR4ICsgeG9mZnNldDtcbiAgICAgICAgICAgICAgICByZXN1bHR5c1syICogaSArIDFdID0gbmV4dHkgLSB5b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHhzWzQgKiBsZW4gLSAyICogaSAtIDJdID0gbmV4dHggLSB4b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHlzWzQgKiBsZW4gLSAyICogaSAtIDJdID0gbmV4dHkgKyB5b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHhzWzQgKiBsZW4gLSAyICogaSAtIDFdID0geCAtIHhvZmZzZXQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0eXNbNCAqIGxlbiAtIDIgKiBpIC0gMV0gPSB5ICsgeW9mZnNldDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhbnZhcy5tb3ZlVG8ocmVzdWx0eHNbMF0sIHJlc3VsdHlzWzBdKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0eHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMubGluZVRvKHJlc3VsdHhzW2ldLCByZXN1bHR5c1tpXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICBjYW52YXMuZmlsbCgpO1xuICAgICAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY2FudmFzLnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBGaXJlV29ya3NCb21iVmlldzIgZXh0ZW5kcyBCYXNlVmlldyB7XG4gICAgICAgIHB1YmxpYyB4czogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyB5czogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyByZW5kZXJYczogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyByZW5kZXJZczogbnVtYmVyW107XG4gICAgICAgIHB1YmxpYyBhbHBoYTogbnVtYmVyID0gMTtcbiAgICAgICAgY29uc3RydWN0b3IoY3g6IG51bWJlciwgY3k6IG51bWJlciwgYW5nbGU6IG51bWJlciwgcmFkaXVzOiBudW1iZXIpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgICAgIC8vIGxldCB4czpudW1iZXJbXTtcbiAgICAgICAgICAgIC8vIGxldCB5czpudW1iZXJbXTtcbiAgICAgICAgICAgIHRoaXMueHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMueXMgPSBbXTtcblxuICAgICAgICAgICAgLy8geHNbMF09IGN4O1xuICAgICAgICAgICAgLy8geXNbMF0gPWN5O1xuICAgICAgICAgICAgbGV0IGV4ID0gTWF0aC5jb3MoYW5nbGUpICogcmFkaXVzICsgY3g7XG4gICAgICAgICAgICBsZXQgZXkgPSBNYXRoLnNpbihNYXRoLnJhbmRvbSgpICogTWF0aC5QSSkgKiBNYXRoLnNpbihhbmdsZSkgKiByYWRpdXMgKyBjeTtcbiAgICAgICAgICAgIGxldCBkeDogbnVtYmVyID0gZXggLSBjeDtcbiAgICAgICAgICAgIGxldCBkeTogbnVtYmVyID0gZXkgLSBjeTtcbiAgICAgICAgICAgIGxldCBzaXplOiBudW1iZXIgPSAxMDA7XG4gICAgICAgICAgICBsZXQgc3RlcHg6IG51bWJlciA9IGR4IC8gc2l6ZTtcbiAgICAgICAgICAgIGxldCBzdGVweTogbnVtYmVyID0gZHkgLyBzaXplO1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyArK2kpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnhzLnB1c2goY3ggKyBzdGVweCAqIGkpO1xuICAgICAgICAgICAgICAgIHRoaXMueXMucHVzaChjeSArIHN0ZXB5ICogaSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJlbmRlclhzID0gW107XG4gICAgICAgICAgICB0aGlzLnJlbmRlcllzID0gW107XG5cbiAgICAgICAgfVxuXG4gICAgICAgIG9uRHJhdyhjYW52YXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICAgICAgICAgICAgc3VwZXIub25EcmF3KGNhbnZhcyk7XG4gICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlciA9IHRoaXMuaWQ7Ly9NYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuXG4gICAgICAgICAgICBsZXQgcmFkaXVzOiBudW1iZXIgPSAyO1xuICAgICAgICAgICAgbGV0IGxlbiA9IHRoaXMucmVuZGVyWXMubGVuZ3RoO1xuXG4gICAgICAgICAgICBjYW52YXMuc2F2ZSgpO1xuICAgICAgICAgICAgY2FudmFzLmdsb2JhbEFscGhhID0gdGhpcy5hbHBoYTtcbiAgICAgICAgICAgIGNhbnZhcy5maWxsU3R5bGUgPSBDb2xvcltpbmRleCAlIENvbG9yLmxlbmd0aF07XG4gICAgICAgICAgICBjYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjYW52YXMuYXJjKHRoaXMucmVuZGVyWHNbbGVuIC0gMV0sIHRoaXMucmVuZGVyWXNbbGVuIC0gMV0sIHJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xuICAgICAgICAgICAgbGV0IHJlc3VsdHhzID0gW107XG4gICAgICAgICAgICBsZXQgcmVzdWx0eXMgPSBbXTtcbiAgICAgICAgICAgIHZhciBuZXh0eDogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIHZhciBuZXh0eTogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIHZhciBsYXN0YTogbnVtYmVyID0gMDtcbiAgICAgICAgICAgIGxldCBwYWRkaW5nOiBudW1iZXIgPSA1O1xuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnJlbmRlclhzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgcGFkZGluZyA9IGkgLyB0aGlzLnJlbmRlclhzLmxlbmd0aCAqIHJhZGl1cztcbiAgICAgICAgICAgICAgICB2YXIgeCA9IHRoaXMucmVuZGVyWHNbaV07XG4gICAgICAgICAgICAgICAgdmFyIHkgPSB0aGlzLnJlbmRlcllzW2ldO1xuICAgICAgICAgICAgICAgIHZhciBuZXh0eCA9IHg7XG4gICAgICAgICAgICAgICAgdmFyIG5leHR5ID0geTtcbiAgICAgICAgICAgICAgICB2YXIgYTogbnVtYmVyID0gbGFzdGE7XG4gICAgICAgICAgICAgICAgaWYgKGkgKyAxIDwgdGhpcy5yZW5kZXJYcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV4dHggPSB0aGlzLnJlbmRlclhzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgbmV4dHkgPSB0aGlzLnJlbmRlcllzW2kgKyAxXTtcbiAgICAgICAgICAgICAgICAgICAgYSA9IE1hdGguYXRhbigobmV4dHkgLSB5KSAvIChuZXh0eCAtIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgbGFzdGEgPSBhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgeG9mZnNldCA9IHBhZGRpbmcgKiBNYXRoLnNpbihhKVxuICAgICAgICAgICAgICAgIHZhciB5b2Zmc2V0ID0gcGFkZGluZyAqIE1hdGguY29zKGEpO1xuICAgICAgICAgICAgICAgIHJlc3VsdHhzWzIgKiBpXSA9IHggKyB4b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHlzWzIgKiBpXSA9IHkgLSB5b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHhzWzIgKiBpICsgMV0gPSBuZXh0eCArIHhvZmZzZXQ7XG4gICAgICAgICAgICAgICAgcmVzdWx0eXNbMiAqIGkgKyAxXSA9IG5leHR5IC0geW9mZnNldDtcbiAgICAgICAgICAgICAgICByZXN1bHR4c1s0ICogbGVuIC0gMiAqIGkgLSAyXSA9IG5leHR4IC0geG9mZnNldDtcbiAgICAgICAgICAgICAgICByZXN1bHR5c1s0ICogbGVuIC0gMiAqIGkgLSAyXSA9IG5leHR5ICsgeW9mZnNldDtcbiAgICAgICAgICAgICAgICByZXN1bHR4c1s0ICogbGVuIC0gMiAqIGkgLSAxXSA9IHggLSB4b2Zmc2V0O1xuICAgICAgICAgICAgICAgIHJlc3VsdHlzWzQgKiBsZW4gLSAyICogaSAtIDFdID0geSArIHlvZmZzZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYW52YXMubW92ZVRvKHJlc3VsdHhzWzBdLCByZXN1bHR5c1swXSk7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHhzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmxpbmVUbyhyZXN1bHR4c1tpXSwgcmVzdWx0eXNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FudmFzLmZpbGwoKTtcbiAgICAgICAgICAgIGNhbnZhcy5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIGNhbnZhcy5yZXN0b3JlKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIEZpcmVBbmltYXRpb24gZXh0ZW5kcyBBbmltYXRpb24ge1xuICAgICAgICBwcml2YXRlIHhzOiBudW1iZXJbXTtcbiAgICAgICAgcHJpdmF0ZSB5czogbnVtYmVyW107XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgICAgIHRoaXMuZWFzZSA9IG5ldyBBbmltYXRpb25FYXNlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBhcHBseVRyYW5zZm9ybWF0aW9uKGludGVycG9sYXRlZFRpbWU6IG51bWJlciwgY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHZpZXc6IEJhc2VWaWV3KSB7XG4gICAgICAgICAgICBsZXQgc2NhbGU6IG51bWJlciA9IHRoaXMuZnJvbSArICh0aGlzLnRvIC0gdGhpcy5mcm9tKSAqIGludGVycG9sYXRlZFRpbWU7XG5cbiAgICAgICAgICAgIGxldCBpbmRleDogbnVtYmVyID0gTWF0aC5mbG9vcigodGhpcy54cy5sZW5ndGggLSAxKSAqIHNjYWxlKTtcbiAgICAgICAgICAgIGlmICh2aWV3IGluc3RhbmNlb2YgRmlyZVdvcmtzQm9tYlZpZXcgfHwgdmlldyBpbnN0YW5jZW9mIEZpcmVXb3Jrc0JvbWJWaWV3Mikge1xuICAgICAgICAgICAgICAgIHZpZXcuYWxwaGEgPSAxIC0gc2NhbGUgKiAwLjg7XG4gICAgICAgICAgICAgICAgbGV0IHNpemU6IG51bWJlciA9IDMwO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnhzLmxlbmd0aCAtIDEgPCBpbmRleCArIHNpemUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZSA9IHRoaXMueHMubGVuZ3RoIC0gaW5kZXggLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlclhzID0gdGhpcy54cy5zbGljZShpbmRleCwgaW5kZXggKyBzaXplKTtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcllzID0gdGhpcy55cy5zbGljZShpbmRleCwgaW5kZXggKyBzaXplKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBvblN0YXJ0QW5pbWF0aW9uKGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB2aWV3OiBCYXNlVmlldyk6IHZvaWQge1xuICAgICAgICAgICAgaWYgKHZpZXcgaW5zdGFuY2VvZiBGaXJlV29ya3NCb21iVmlldyB8fCB2aWV3IGluc3RhbmNlb2YgRmlyZVdvcmtzQm9tYlZpZXcyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54cyA9IHZpZXcueHMuc2xpY2UoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy55cyA9IHZpZXcueXMuc2xpY2UoMCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBvbkVuZEFuaW1hdGlvbihjYW52YXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCwgdmlldzogQmFzZVZpZXcpOiB2b2lkIHtcbiAgICAgICAgICAgIGlmICh2aWV3IGluc3RhbmNlb2YgRmlyZVdvcmtzQm9tYlZpZXcgfHwgdmlldyBpbnN0YW5jZW9mIEZpcmVXb3Jrc0JvbWJWaWV3Mikge1xuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyWHMgPSBbXTtcbiAgICAgICAgICAgICAgICB2aWV3LnJlbmRlcllzID0gW107XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBleHBvcnQgY2xhc3MgRmlyZVdvcmtzQ29udGFpbmVyIGV4dGVuZHMgVmlld0dyb3VwIHtcbiAgICAgICAgcmVuZGVyWDogbnVtYmVyO1xuICAgICAgICByZW5kZXJZOiBudW1iZXI7XG4gICAgICAgIHg6IG51bWJlcjtcbiAgICAgICAgeTogbnVtYmVyO1xuICAgICAgICBoOiBudW1iZXI7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG9uRHJhdyhjYW52YXM6IENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk6IHZvaWQge1xuICAgICAgICAgICAgc3VwZXIub25EcmF3KGNhbnZhcyk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZW5kZXJYID09IG51bGwgfHwgdGhpcy5yZW5kZXJZID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgaW5kZXg6IG51bWJlciA9IHRoaXMuaWQ7XG4gICAgICAgICAgICBsZXQgcmFkaXVzOiBudW1iZXIgPSA1O1xuICAgICAgICAgICAgY2FudmFzLnNhdmUoKTtcbiAgICAgICAgICAgIGNhbnZhcy5maWxsU3R5bGUgPSBDb2xvcltpbmRleCAlIENvbG9yLmxlbmd0aF07XG4gICAgICAgICAgICBjYW52YXMuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjYW52YXMuYXJjKHRoaXMucmVuZGVyWCwgdGhpcy5yZW5kZXJZLCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcbiAgICAgICAgICAgIGxldCByZXN1bHR4cyA9IFtdO1xuICAgICAgICAgICAgbGV0IHJlc3VsdHlzID0gW107XG4gICAgICAgICAgICB2YXIgbmV4dHg6IG51bWJlciA9IDA7XG4gICAgICAgICAgICB2YXIgbmV4dHk6IG51bWJlciA9IDA7XG4gICAgICAgICAgICB2YXIgbGFzdGE6IG51bWJlciA9IDA7XG4gICAgICAgICAgICBsZXQgcGFkZGluZzogbnVtYmVyID0gNTtcbiAgICAgICAgICAgIHJlc3VsdHhzWzBdID0gdGhpcy5yZW5kZXJYIC0gcmFkaXVzO1xuICAgICAgICAgICAgcmVzdWx0eXNbMF0gPSB0aGlzLnJlbmRlclk7XG4gICAgICAgICAgICByZXN1bHR4c1sxXSA9IHRoaXMucmVuZGVyWCArIHJhZGl1cztcbiAgICAgICAgICAgIHJlc3VsdHlzWzFdID0gdGhpcy5yZW5kZXJZO1xuICAgICAgICAgICAgcmVzdWx0eHNbMl0gPSB0aGlzLnJlbmRlclg7XG4gICAgICAgICAgICByZXN1bHR5c1syXSA9IHRoaXMucmVuZGVyWSArIDEwMDtcbiAgICAgICAgICAgIGNhbnZhcy5tb3ZlVG8ocmVzdWx0eHNbMF0sIHJlc3VsdHlzWzBdKTtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0eHMubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgICAgICBjYW52YXMubGluZVRvKHJlc3VsdHhzW2ldLCByZXN1bHR5c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYW52YXMuZmlsbCgpO1xuICAgICAgICAgICAgY2FudmFzLmNsb3NlUGF0aCgpO1xuICAgICAgICAgICAgY2FudmFzLnJlc3RvcmUoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGV4cG9ydCBjbGFzcyBMaW5lQW5pbWF0aW9uIGV4dGVuZHMgQW5pbWF0aW9uIHtcbiAgICAgICAgcHJpdmF0ZSB4OiBudW1iZXI7XG4gICAgICAgIHByaXZhdGUgeTogbnVtYmVyO1xuICAgICAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgICAgIHN1cGVyKCk7XG4gICAgICAgICAgICBsZXQgaW5kZXggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCk7XG4gICAgICAgICAgICBpZiAoaW5kZXggJSAzID09IDApIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVhc2UgPSBuZXcgUG9seU91dEVhc2UoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaW5kZXggJSAzID09IDEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVhc2UgPSBuZXcgUG9seUluRWFzZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmVhc2UgPSBuZXcgQW5pbWF0aW9uRWFzZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICBhcHBseVRyYW5zZm9ybWF0aW9uKGludGVycG9sYXRlZFRpbWU6IG51bWJlciwgY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHZpZXc6IEJhc2VWaWV3KSB7XG4gICAgICAgICAgICBsZXQgc2NhbGU6IG51bWJlciA9IHRoaXMuZnJvbSArICh0aGlzLnRvIC0gdGhpcy5mcm9tKSAqIGludGVycG9sYXRlZFRpbWU7XG4gICAgICAgICAgICBpZiAodmlldyBpbnN0YW5jZW9mIEZpcmVXb3Jrc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyWCA9IHRoaXMueDsvLytNYXRoLnJhbmRvbSgpKjEwLTU7XG4gICAgICAgICAgICAgICAgdmlldy5yZW5kZXJZID0gdGhpcy55IC0gdmlldy5oICogc2NhbGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBvblN0YXJ0QW5pbWF0aW9uKGNhbnZhczogQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJELCB2aWV3OiBCYXNlVmlldyk6IHZvaWQge1xuICAgICAgICAgICAgaWYgKHZpZXcgaW5zdGFuY2VvZiBGaXJlV29ya3NDb250YWluZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnggPSB2aWV3Lng7XG4gICAgICAgICAgICAgICAgdGhpcy55ID0gdmlldy55O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICAgICAgb25FbmRBbmltYXRpb24oY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHZpZXc6IEJhc2VWaWV3KTogdm9pZCB7XG4gICAgICAgICAgICBpZiAodmlldyBpbnN0YW5jZW9mIEZpcmVXb3Jrc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyWCA9IG51bGw7Ly8gdGhpcy54O1xuICAgICAgICAgICAgICAgIHZpZXcucmVuZGVyWSA9IG51bGw7Ly90aGlzLnk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZXhwb3J0IGNsYXNzIEZpcmVMYXlvdXQgZXh0ZW5kcyBSb290VmlldyB7XG4gICAgICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGluaXQoKSB7XG5cbiAgICAgICAgICAgIGZvciAobGV0IG0gPSAwOyBtIDwgNTA7ICsrbSkge1xuICAgICAgICAgICAgICAgIGxldCBzaXplOiBudW1iZXIgPSA0MDA7XG4gICAgICAgICAgICAgICAgbGV0IHN0YXJ0QW5nbGU6IG51bWJlciA9IDA7Ly8qTWF0aC5QSS8xODA7XG4gICAgICAgICAgICAgICAgbGV0IGVuZEFuZ2xlOiBudW1iZXIgPSAzNjA7Ly8gKiBNYXRoLlBJLzE4MDtcbiAgICAgICAgICAgICAgICBsZXQgY29uc3RjeDogbnVtYmVyID0gNDAwICsgTWF0aC5yYW5kb20oKSAqIDMwMCAtIDE1MDtcbiAgICAgICAgICAgICAgICBsZXQgY29uc3RjeTogbnVtYmVyID0gMjAwO1xuICAgICAgICAgICAgICAgIGxldCByYWRpdXM6IG51bWJlciA9IDMwMDtcbiAgICAgICAgICAgICAgICBsZXQgZmlyZVdvcmtzQ29udGFpbmVyOiBGaXJlV29ya3NDb250YWluZXIgPSBuZXcgRmlyZVdvcmtzQ29udGFpbmVyKCk7XG4gICAgICAgICAgICAgICAgZmlyZVdvcmtzQ29udGFpbmVyLmggPSA2MDA7XG4gICAgICAgICAgICAgICAgZmlyZVdvcmtzQ29udGFpbmVyLnggPSBjb25zdGN4O1xuICAgICAgICAgICAgICAgIGZpcmVXb3Jrc0NvbnRhaW5lci55ID0gY29uc3RjeSArIGZpcmVXb3Jrc0NvbnRhaW5lci5oO1xuICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgKytpKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBhbmdsZTogbnVtYmVyID0gKHN0YXJ0QW5nbGUgKyAoZW5kQW5nbGUgLSBzdGFydEFuZ2xlKSAvIHNpemUgKiBpKSAqIE1hdGguUEkgLyAxODA7XG4gICAgICAgICAgICAgICAgICAgIGxldCB4czogbnVtYmVyW10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHlzOiBudW1iZXJbXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBsZXQgY3ggPSBjb25zdGN4Oy8vKyBNYXRoLnJhbmRvbSgpICogMjA7XG4gICAgICAgICAgICAgICAgICAgIGxldCBjeSA9IGNvbnN0Y3k7Ly8rIE1hdGgucmFuZG9tKCkgKiAyMDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG0gJSAyID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBmaXJlOiBGaXJlV29ya3NCb21iVmlldzIgPSBuZXcgRmlyZVdvcmtzQm9tYlZpZXcyKGN4LCBjeSwgYW5nbGUsIHJhZGl1cyArIE1hdGgucmFuZG9tKCkgKiAxMDApO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsZXQgZmlyZTogRmlyZVdvcmtzQm9tYlZpZXcgPSBuZXcgRmlyZVdvcmtzQm9tYlZpZXcoY3gsIGN5LCBhbmdsZSwgcmFkaXVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZVdvcmtzQ29udGFpbmVyLmFkZFZpZXcoZmlyZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgZmlyZTogRmlyZVdvcmtzQm9tYlZpZXcgPSBuZXcgRmlyZVdvcmtzQm9tYlZpZXcoY3gsIGN5LCBhbmdsZSwgcmFkaXVzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcmUuaWQgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgZmlyZVdvcmtzQ29udGFpbmVyLmFkZFZpZXcoZmlyZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRWaWV3KGZpcmVXb3Jrc0NvbnRhaW5lcik7XG4gICAgICAgICAgICAgICAgZmlyZVdvcmtzQ29udGFpbmVyLmlkID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTAwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICAgICAgYW5pbWF0aW9uVGVzdCgpIHtcbiAgICAgICAgICAgIGxldCBpbmRleDpudW1iZXIgPSAwXG4gICAgICAgICAgICBmb3IgKGxldCB2aWV3IG9mIHRoaXMuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAodmlldyBpbnN0YW5jZW9mIEZpcmVXb3Jrc0NvbnRhaW5lcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGZpcmVXb3Jrc0NvbnRhaW5lcjogRmlyZVdvcmtzQ29udGFpbmVyID0gdmlldztcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBhbmltYXRpb24xOiBMaW5lQW5pbWF0aW9uID0gbmV3IExpbmVBbmltYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjEuZHVyYXRpb24gPSAxMDAwICsgTWF0aC5yYW5kb20oKSAqIDEwMDA7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24xLmZyb20gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uMS50byA9IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJlV29ya3NDb250YWluZXIuc3RhcnRBbmltYXRpb24oYW5pbWF0aW9uMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgb2xkYW5pbWF0aW9uRW5kID0gYW5pbWF0aW9uMS5vbkVuZEFuaW1hdGlvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbjEub25FbmRBbmltYXRpb24gPSAoY2FudmFzOiBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQsIHZpZXc6IEJhc2VWaWV3KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkYW5pbWF0aW9uRW5kKGNhbnZhcywgdmlldyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChsZXQgdmlldyBvZiBmaXJlV29ya3NDb250YWluZXIuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbGV0IGFuaW1hdGlvbiA9IG5ldyBGaXJlQW5pbWF0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFuaW1hdGlvbi5kdXJhdGlvbiA9IE1hdGgucmFuZG9tKCkgKiAxMDAwICsgMjAwMDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5pbWF0aW9uLmZyb20gPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmltYXRpb24udG8gPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aWV3LnN0YXJ0QW5pbWF0aW9uKGFuaW1hdGlvbik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgaW5kZXgqKDEwMDArTWF0aC5yYW5kb20oKSoxMDAwKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgZXhwb3J0IGNsYXNzIFNwbGluZSB7XG4gICAgICAgIC8vIFxuICAgICAgICBwcml2YXRlIGsgPSAwLjAwMjtcblxuICAgICAgICBwcml2YXRlIF94OiBudW1iZXJbXTtcbiAgICAgICAgcHJpdmF0ZSBfeTogbnVtYmVyW107XG5cbiAgICAgICAgcHJpdmF0ZSBfYTogUG9pbnRbXSA9IFtdO1xuICAgICAgICBwcml2YXRlIF9iOiBQb2ludFtdID0gW107XG4gICAgICAgIHByaXZhdGUgX2M6IFBvaW50W10gPSBbXTtcbiAgICAgICAgcHJpdmF0ZSBfZDogUG9pbnRbXSA9IFtdO1xuXG4gICAgICAgIHByaXZhdGUgX2xlbjogbnVtYmVyO1xuXG4gICAgICAgIC8vICBUXjMgICAgIC0xICAgICArMyAgICAtMyAgICArMSAgICAgL1xuICAgICAgICAvLyAgVF4yICAgICArMiAgICAgLTUgICAgIDQgICAgLTEgICAgL1xuICAgICAgICAvLyAgVF4xICAgICAtMSAgICAgIDAgICAgIDEgICAgIDAgICAvICAyXG4gICAgICAgIC8vICBUXjAgICAgICAwICAgICAgMiAgICAgMCAgICAgMCAgL1xuXG4gICAgICAgIHByaXZhdGUgbSA9IFtcbiAgICAgICAgICAgIFstMSAqIDAuNSwgKzMgKiAwLjUsIC0zICogMC41LCArMSAqIDAuNV0sXG4gICAgICAgICAgICBbKzIgKiAwLjUsIC01ICogMC41LCArNCAqIDAuNSwgLTEgKiAwLjVdLFxuICAgICAgICAgICAgWy0xICogMC41LCAwLCArMSAqIDAuNSwgMF0sXG4gICAgICAgICAgICBbMCwgKzIgKiAwLjUsIDAsIDBdLFxuICAgICAgICAgICAgLy8gWzEsMCwwLDBdLFxuICAgICAgICAgICAgLy8gWy0zLDMsMCwwXSxcbiAgICAgICAgICAgIC8vIFszLC02LDMsMF0sXG4gICAgICAgICAgICAvLyBbLTEsMywtMywxXVxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlcltdLCB5OiBudW1iZXJbXSkge1xuICAgICAgICAgICAgdGhpcy5feCA9IHg7XG4gICAgICAgICAgICB0aGlzLl95ID0geTtcblxuICAgICAgICAgICAgdmFyIGxlbiA9IHRoaXMuX2xlbiA9IE1hdGgubWluKHgubGVuZ3RoLCB5Lmxlbmd0aCk7XG5cbiAgICAgICAgICAgIGlmIChsZW4gPiAzKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW4gLSAxOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHAxID0gKGkgPT0gMCkgPyBuZXcgUG9pbnQoeFtpXSwgeVtpXSkgOiBuZXcgUG9pbnQoeFtpIC0gMV0sIHlbaSAtIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHAyID0gbmV3IFBvaW50KHhbaV0sIHlbaV0pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcDMgPSBuZXcgUG9pbnQoeFtpICsgMV0sIHlbaSArIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHA0ID0gKGkgPT0gbGVuIC0gMikgPyBuZXcgUG9pbnQoeFtpICsgMV0sIHlbaSArIDFdKSA6IG5ldyBQb2ludCh4W2kgKyAyXSwgeVtpICsgMl0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBhID0gbmV3IFBvaW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBiID0gbmV3IFBvaW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjID0gbmV3IFBvaW50KCk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBkID0gbmV3IFBvaW50KCk7XG5cbiAgICAgICAgICAgICAgICAgICAgYS54ID0gcDEueCAqIHRoaXMubVswXVswXSArIHAyLnggKiB0aGlzLm1bMF1bMV0gKyBwMy54ICogdGhpcy5tWzBdWzJdICsgcDQueCAqIHRoaXMubVswXVszXTtcbiAgICAgICAgICAgICAgICAgICAgYi54ID0gcDEueCAqIHRoaXMubVsxXVswXSArIHAyLnggKiB0aGlzLm1bMV1bMV0gKyBwMy54ICogdGhpcy5tWzFdWzJdICsgcDQueCAqIHRoaXMubVsxXVszXTtcbiAgICAgICAgICAgICAgICAgICAgYy54ID0gcDEueCAqIHRoaXMubVsyXVswXSArIHAyLnggKiB0aGlzLm1bMl1bMV0gKyBwMy54ICogdGhpcy5tWzJdWzJdICsgcDQueCAqIHRoaXMubVsyXVszXTtcbiAgICAgICAgICAgICAgICAgICAgZC54ID0gcDEueCAqIHRoaXMubVszXVswXSArIHAyLnggKiB0aGlzLm1bM11bMV0gKyBwMy54ICogdGhpcy5tWzNdWzJdICsgcDQueCAqIHRoaXMubVszXVszXTtcblxuICAgICAgICAgICAgICAgICAgICBhLnkgPSBwMS55ICogdGhpcy5tWzBdWzBdICsgcDIueSAqIHRoaXMubVswXVsxXSArIHAzLnkgKiB0aGlzLm1bMF1bMl0gKyBwNC55ICogdGhpcy5tWzBdWzNdO1xuICAgICAgICAgICAgICAgICAgICBiLnkgPSBwMS55ICogdGhpcy5tWzFdWzBdICsgcDIueSAqIHRoaXMubVsxXVsxXSArIHAzLnkgKiB0aGlzLm1bMV1bMl0gKyBwNC55ICogdGhpcy5tWzFdWzNdO1xuICAgICAgICAgICAgICAgICAgICBjLnkgPSBwMS55ICogdGhpcy5tWzJdWzBdICsgcDIueSAqIHRoaXMubVsyXVsxXSArIHAzLnkgKiB0aGlzLm1bMl1bMl0gKyBwNC55ICogdGhpcy5tWzJdWzNdO1xuICAgICAgICAgICAgICAgICAgICBkLnkgPSBwMS55ICogdGhpcy5tWzNdWzBdICsgcDIueSAqIHRoaXMubVszXVsxXSArIHAzLnkgKiB0aGlzLm1bM11bMl0gKyBwNC55ICogdGhpcy5tWzNdWzNdO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2EucHVzaChhKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fYi5wdXNoKGIpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jLnB1c2goYyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2QucHVzaChkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcml2YXRlIGNhbGN1bGF0ZVBvaW50KHZhbDogbnVtYmVyKTogYW55IHtcbiAgICAgICAgICAgIHZhciBpID0gTWF0aC5mbG9vcih2YWwpO1xuXG4gICAgICAgICAgICBpZiAoaSA8IDApIHtcbiAgICAgICAgICAgICAgICBpID0gMDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGkgPiB0aGlzLl9sZW4gLSAyKSB7XG4gICAgICAgICAgICAgICAgaSA9IHRoaXMuX2xlbiAtIDI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBkID0gdmFsIC0gaTtcblxuICAgICAgICAgICAgdmFyIHggPSAoKHRoaXMuX2FbaV0ueCAqIGQgKyB0aGlzLl9iW2ldLngpICogZCArIHRoaXMuX2NbaV0ueCkgKiBkICsgdGhpcy5fZFtpXS54O1xuICAgICAgICAgICAgdmFyIHkgPSAoKHRoaXMuX2FbaV0ueSAqIGQgKyB0aGlzLl9iW2ldLnkpICogZCArIHRoaXMuX2NbaV0ueSkgKiBkICsgdGhpcy5fZFtpXS55O1xuXG4gICAgICAgICAgICByZXR1cm4geyB4OiB4LCB5OiB5IH07XG4gICAgICAgIH1cblxuICAgICAgICBjYWxjdWxhdGUoeHNjYWxlOiBudW1iZXIgPSAxLCB5c2NhbGU6IG51bWJlciA9IDEpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9sZW4gPD0gMykge1xuICAgICAgICAgICAgICAgIHJldHVybiB7IHhzOiB0aGlzLl94LCB5czogdGhpcy5feSB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgeHMgPSBbXTtcbiAgICAgICAgICAgIHZhciB5cyA9IFtdO1xuXG4gICAgICAgICAgICB2YXIgcDAgPSB0aGlzLmNhbGN1bGF0ZVBvaW50KDApO1xuICAgICAgICAgICAgeHMucHVzaChwMC54KTtcbiAgICAgICAgICAgIHlzLnB1c2gocDAueSk7XG5cbiAgICAgICAgICAgIHZhciBkZWx0YSA9IHRoaXMuX2xlbiAqIHRoaXMuaztcbiAgICAgICAgICAgIHZhciBkeCA9IDMgKiB4c2NhbGU7XG4gICAgICAgICAgICB2YXIgZHkgPSAzICogeXNjYWxlO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gZGVsdGE7IGkgPD0gdGhpcy5fbGVuIC0gMTsgaSArPSBkZWx0YSkge1xuICAgICAgICAgICAgICAgIHZhciBwID0gdGhpcy5jYWxjdWxhdGVQb2ludChpKTtcbiAgICAgICAgICAgICAgICBpZiAoTWF0aC5hYnMocDAueCAtIHAueCkgPj0gZHggfHwgTWF0aC5hYnMocDAueSAtIHAueSkgPj0gZHkpIHtcbiAgICAgICAgICAgICAgICAgICAgeHMucHVzaChwLngpO1xuICAgICAgICAgICAgICAgICAgICB5cy5wdXNoKHAueSlcbiAgICAgICAgICAgICAgICAgICAgcDAgPSBwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh4c1t4cy5sZW5ndGggLSAxXS54ICE9IHAueCB8fCB5c1t5cy5sZW5ndGggLSAxXS55ICE9IHAueSkge1xuICAgICAgICAgICAgICAgIHhzLnB1c2gocC54KTtcbiAgICAgICAgICAgICAgICB5cy5wdXNoKHAueSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7IHhzOiB4cywgeXM6IHlzIH07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgXG5cbiAgICBleHBvcnQgY2xhc3MgUG9seUluRWFzZSBleHRlbmRzIEFuaW1hdGlvbkVhc2Uge1xuICAgICAgICBwdWJsaWMgZWFzZSh0OiBudW1iZXIpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLnBvdyh0LCAzKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBleHBvcnQgY2xhc3MgUG9seU91dEVhc2UgZXh0ZW5kcyBBbmltYXRpb25FYXNlIHtcbiAgICAgICAgcHVibGljIGVhc2UodDogbnVtYmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gMSAtIE1hdGgucG93KDEgLSB0LCAzKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IEZSQU1FOiBudW1iZXIgPSA2MDtcbiAgICBleHBvcnQgY2xhc3MgQmV6aWVyIHtcblxuICAgICAgICAvLyBjb250cm9sUG9pbnRzOiBQb2ludFtdO1xuICAgICAgICB4czpudW1iZXJbXTtcbiAgICAgICAgeXM6bnVtYmVyW107XG4gICAgICAgIGNvbnN0cnVjdG9yKHhzOm51bWJlcltdLHlzOm51bWJlcltdKSB7XG4gICAgICAgICAgICAvLyB0aGlzLmNvbnRyb2xQb2ludHMgPSBbXTtcbiAgICAgICAgICAgIHRoaXMueHM9eHM7XG4gICAgICAgICAgICB0aGlzLnlzPXlzO1xuICAgICAgICB9XG4gICAgICAgIHByaXZhdGUgYnVpbGRCZXppZXJQb2ludHMoKXtcbiAgICAgICAgICAgIC8vIGxldCBwb2ludHM6IFBvaW50W10gPSBbXTtcbiAgICAgICAgICAgIGxldCB4czpudW1iZXJbXT1bXTtcbiAgICAgICAgICAgIGxldCB5czpudW1iZXJbXT1bXTtcbiAgICAgICAgICAgIC8vIGxldCBvcmRlciA9IHRoaXMuY29udHJvbFBvaW50cy5sZW5ndGggLSAxO1xuICAgICAgICAgICAgbGV0IG9yZGVyID0gdGhpcy54cy5sZW5ndGgtMTtcbiAgICAgICAgICAgIGxldCBkZWx0YSA9IDEuMCAvIEZSQU1FO1xuICAgICAgICAgICAgZm9yIChsZXQgdCA9IDA7IHQgPD0gMTsgdCArPSBkZWx0YSkge1xuICAgICAgICAgICAgICAgIC8vIHBvaW50cy5wdXNoKG5ldyBQb2ludCh0aGlzLmRlQ2FzdGVsamF1WChvcmRlciwgMCwgdCksIHRoaXMuZGVDYXN0ZWxqYXVZKG9yZGVyLCAwLCB0KSkpO1xuICAgICAgICAgICAgICAgIHhzLnB1c2godGhpcy5kZUNhc3RlbGphdVgob3JkZXIsIDAsIHQpKTtcbiAgICAgICAgICAgICAgICB5cy5wdXNoKCB0aGlzLmRlQ2FzdGVsamF1WShvcmRlciwgMCwgdCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHsneHMnOnhzLCd5cyc6eXN9O1xuICAgICAgICB9XG5cblxuXG4gICAgICAgIFxuICAgICAgICBwcml2YXRlIGRlQ2FzdGVsamF1WChpOiBudW1iZXIsIGo6IG51bWJlciwgdDogbnVtYmVyKSB7XG4gICAgICAgICAgICBpZiAoaSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgLy8gcmV0dXJuICgxIC0gdCkgKiB0aGlzLmNvbnRyb2xQb2ludHNbaV0ueCArIHQgKiB0aGlzLmNvbnRyb2xQb2ludHNbaiArIDFdLng7XG4gICAgICAgICAgICAgICAgcmV0dXJuICgxIC0gdCkgKiB0aGlzLnhzW2ldICsgdCAqIHRoaXMueHNbaiArIDFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICgxIC0gdCkgKiB0aGlzLmRlQ2FzdGVsamF1WChpIC0gMSwgaiwgdCkgKyB0ICogdGhpcy5kZUNhc3RlbGphdVgoaSAtIDEsIGogKyAxLCB0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHByaXZhdGUgZGVDYXN0ZWxqYXVZKGk6IG51bWJlciwgajogbnVtYmVyLCB0OiBudW1iZXIpIHtcbiAgICAgICAgICAgIGlmIChpID09IDEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gKDEgLSB0KSAqIHRoaXMueXNbal0gKyB0ICogdGhpcy55c1soaiArIDEpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAoMSAtIHQpICogdGhpcy5kZUNhc3RlbGphdVkoaSAtIDEsIGosIHQpICsgdCAqIHRoaXMuZGVDYXN0ZWxqYXVZKGkgLSAxLCBqICsgMSwgdCk7XG4gICAgICAgIH1cblxuICAgIH1cblxuXG5cbn0iXX0=
