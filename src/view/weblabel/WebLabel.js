import BaseEvent from './BaseEvent';

import RectLayer from './RectLayer';

import eventBus from './eventBus';
// import { pointsLength } from './util';

class WebLabel extends BaseEvent {
    constructor(props) {
        super();
        this.scale = this.originScale = 1; //放大 缩小倍数
        this.moveLengthThreshold = 2;
        this.eventList = new Set(); // 存储event信息
        this.$wrap = null;
        // 是否支持一些操作
        // 是否支持放大
        this.zoom = false;
        // 是否支持拖拽
        this.drag = false;
        // TODO:后续考虑做成 proxy形式
        const { wrapId, imgLayer } = props || {};
        const $wrap = document.getElementById(wrapId);
        if ($wrap) {
            //  make $wrap style posioton relative
            // create a div to wrap
            const $wrapDiv = document.createElement('div');
            $wrapDiv.style.cssText +=
                'font-size:0;position:relative;width:100%;height: 100%';
            // forbiden select
            $wrapDiv.addEventListener('selectstart', () => false);
            this.$wrapDiv = $wrapDiv;

            const $canvas = document.createElement('canvas');
            const $editCanvas = document.createElement('canvas');
            this._canvas = $canvas || {};
            this._context = this._canvas.getContext('2d');
            this._editCanvas = $editCanvas || {};
            this._editCtx = $editCanvas.getContext('2d');
            const canvasCssText = `position:absolute;top: 0;left: 0;bottom: 0;right: 0;`;
            $canvas.style.cssText += canvasCssText + 'z-index:100;';
            $editCanvas.style.cssText += canvasCssText + 'z-index:101;';
            $wrapDiv.appendChild($canvas);
            $wrapDiv.appendChild($editCanvas);
            $wrap.appendChild($wrapDiv);

            // 初始化props
            this.initProps(props);

            if (imgLayer) {
                imgLayer.then(imgLayer => {
                    $wrapDiv.appendChild(imgLayer);
                    const {
                        clientWidth,
                        clientHeight,
                        originWidth,
                        originHeight
                    } = imgLayer || {};
                    // 计算图片放大缩小比 如果宽比高大 按照高的缩放比例； 如果宽比高小， 按照宽的比例缩放
                    const scaleWidth = clientWidth / originWidth;
                    const scaleHeight = clientHeight / originHeight;
                    let scale = 1;
                    if (scaleWidth > scaleHeight) {
                        scale = this.originScale = scaleHeight;
                    } else {
                        scale = this.originScale = scaleWidth;
                    }
                    this.originWidth = originWidth;
                    this.originHeight = originHeight;
                    this.setScale(scale);
                });
            } else {
                const { clientWidth, clientHeight } = $wrap || {};
                this.originWidth = clientWidth || 1;
                this.originHeight = clientHeight || 1;
                const scale = 1;
                this.setScale(scale);
            }

            this.initCanvasEvent();
        } else {
            console.warn('this is need a id to appent the canvas');
        }
    }

    /**
     * define props
     */
    // 获取公共属性
    get publicProps() {
        return {
            _scale: this.scale,
            _context: this._context,
            _canvas: this._canvas,
            _editCanvas: this._editCanvas,
            _editContext: this._editCtx
        };
    }

    //  设置对应关系
    get layersMap() {
        return {
            rectLayer: RectLayer
        };
    }
    // 设置当前绘制的图层
    set currentLayerName(name) {
        const instance = this.getLayerInstanceName(name);
        this.currentLayer = this[instance];
        this.drag = false;
    }

    /**
     * 将传入的props函数解构 赋值到数据中
     * @param {Object} props
     */
    initProps(props) {
        const { scale, paintLayers, paintTools } = props || {};
        const { max, min, step } = scale || {};
        // 放大缩小大小
        this.maxScale = max || 10;
        this.minScale = min || 0.25;
        this.scaleStep = step || 0.25;

        // 设置最大  最小 canvas 宽高
        this.maxCanvasSize = 5000;
        this.minCanvasSize = 100;

        // init paint layers

        this.initPaintLayers(paintLayers);
        this.initPointTools(paintTools);
    }

    //  初始化图层实例
    initLayer(name) {
        const privateName = this.getLayerInstanceName(name);
        if (this[privateName]) {
            return this[privateName];
        }
        const Fnc = this.layersMap[name];
        if (Fnc) {
            this[privateName] = new Fnc({ publicProps: this.publicProps });
        }
    }
    // 获取实例名称
    getLayerInstanceName(name) {
        return `_${name}`;
    }


    initPointTools({ zoom, drag }){
        this.zoom = zoom;
        this.drag = drag;
    }

    /**
     * init paint layers
     * @param {Array} tools
     */
    initPaintLayers(tools) {
        tools &&
            tools.forEach(tool => {
                this.initLayer(tool);
            });
        this.currentLayerName = tools[0];
    }

    // initCanvas($wrap) {}
    initCanvasSize(width, height) {
        const realWidth = width || 0;
        const realHeight = height || 0;
        this.$wrapDiv.style.cssText += `width:${realWidth}px;height:${realHeight}px`;
        this._canvas.width = realWidth;
        this._canvas.height = realHeight;
        this.setEditCanvasSize();
    }
    setEditCanvasSize() {
        this._editCanvas.width = this._canvas.width;
        this._editCanvas.height = this._canvas.height;
    }

    // init canvas event
    initCanvasEvent() {
        //
        this._editCanvas.addEventListener('mousedown', this.handleMouseDown);
        this._editCanvas.addEventListener('mousemove', this.handleMouseMove);
        this._editCanvas.addEventListener('mouseup', this.handleMouseUp);
        this._editCanvas.addEventListener('mouseleave', this.handleMouseUp);
        // 放大缩小
        this._editCanvas.addEventListener('wheel', this.handleScroll());
    }

    handleMouseDown = e => {
        this._dragMouseDown(e);
    };
    // 拖拽函数
    _dragMouseDown = e => {
        this.downPoint = [e.offsetX, e.offsetY];
        this.eventList.add('mousedown');
    };

    handleMouseMove = e => {
        this._dragMouseMove(e);
    };

    dragImageLayer = currentPoint => {
        this.eventList.add('mousemove');
        this.moveImageLayer(currentPoint);
        this.downPoint = currentPoint;
    };

    //  拖拽
    _dragMouseMove = e => {
        this._editCanvas.style.cursor = 'default';
        if (this.eventList.has('mousedown')) {
            // 如果存在选中点 说明是移动当前图形
            const currentPoint = [e.offsetX, e.offsetY];
            if(this.drag){
                this.dragImageLayer(currentPoint);
            }else{
                this.currentLayer.moveStatus(this.downPoint,currentPoint);
                this.downPoint = currentPoint;
            }
        } else {
            // 绘制了一个点移动
            // 移动
            const loc = [e.offsetX, e.offsetY];
            this.drawMoveStatus(loc);
        }
    };

    drawMoveStatus(loc) {
        this.currentLayer.mouseMove(loc);
    }

    handleMouseUp = e => {
        this._mouseLeave(e);
    };
    // h拖拽
    _mouseLeave = e => {
        // 绘制 第一个点
        const loc = [e.offsetX, e.offsetY];
        if(!this.drag){
            if (this.eventList.has('mousedown')) {
                this.currentLayer.mouseDown(loc);
            } else {
                console.log('移除');
            }
        }
        this.eventList.clear();
    };
    // 移动
    moveImageLayer(point) {
        const [x, y] = point || [];
        const oldLeft = Number(this.$wrapDiv.style.left.replace('px', ''));
        const oldTop = Number(this.$wrapDiv.style.top.replace('px', ''));
        const [startX, startY] = this.downPoint || [];
        const diffX = x - startX + oldLeft;
        const diffY = y - startY + oldTop;
        this.$wrapDiv.style.cssText += `left:${diffX}px; top:${diffY}px`;
    }
    scaleCanvas(scalex, scaley) {
        this.initCanvasSize(
            this.originWidth * scalex,
            this.originHeight * scaley
        );
    }

    /**
     * 设置放大缩小值，如果放大或者缩小之后的宽高 超过最大或最小宽高 不支持缩放
     * @param {int} scale
     */
    setScale(scale) {
        if (scale >= this.minScale && scale <= this.maxScale) {
            const currentCanvasWidth = this.originWidth * scale;
            const currentCanvasHeight = this.originHeight * scale;
            if (
                currentCanvasWidth < this.maxCanvasSize &&
                currentCanvasHeight < this.maxCanvasSize &&
                currentCanvasWidth > this.minCanvasSize &&
                currentCanvasHeight > this.minCanvasSize
            ) {
                this.scale = scale;
                this.scaleCanvas(this.scale, this.scale);
                eventBus._emit('reRender', this.publicProps);
            }
        }
    }
    // 滚动缩放
    handleScroll = () => {
        const threshold = 16.6;
        let startTime = +new Date();
        return e => {
            if(this.zoom){
                const endTime = +new Date();
                if (endTime - startTime > threshold) {
                    startTime = endTime;
                    const wheelDelta = e.wheelDelta || e.detail;
                    let scale = this.scale;
                    if (wheelDelta > 0) {
                        // 向上滚动
                        scale = this.scale + this.scaleStep;
                    } else {
                        //  向下滚动
                        scale = this.scale - this.scaleStep;
                    }
                    this.setScale(scale);
                }
            }
        };
    };
}

export default WebLabel;
