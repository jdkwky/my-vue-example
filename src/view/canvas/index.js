import BaseCanvas from './baseCanvas';
import ImageLayer from './imageLayer';
import PolygonLayer from './polygonLayer';
import RectLayer from './RectLayer';
import LineLayer from './lineLayer';
import ArrowLayer from './arrowLayer'
let pathId = 1;

class Brush extends BaseCanvas {
    constructor({ width = 800, height = 800, el, imageOptions = {}, layersOptions = {} }) {

        const canvas = document.createElement('canvas');
        super(canvas);
        canvas.width = width;
        canvas.height = height;
        this._canvas = canvas;
        this._context = canvas.getContext('2d');
        this._emit('initCanvasOptions', canvas, layersOptions);
        this._isDrawing = false;  // 判断是否在绘图过程中
        this.drawTypeList = ['polygon', 'rect', 'line', 'arrow'];
        this.drawType = "rect";
        this.coordinates = [];
        this.coordinate = [];

        this.wrapOffsetX = 0;
        this.wrapOffsetY = 0;
        this.dragThreshold = 5; // 拖动大于10像素才认为想拖动图片

        this.layersMoveFlag = true;
        this.currentLoc = [0, 0];

        const $el = el || document.body;
        $el.appendChild(canvas);
        // 注册ImageLayer
        this.imageLayer = new ImageLayer({
            ...imageOptions,
            canvas: this._canvas
        });
        this.imageLayer.initLayer().then(() => {
            this.initEvents(this._canvas);
        });
        // 注册多边形
        this.polygon = new PolygonLayer({
            canvas
        })
        // 注册矩形
        this.rect = new RectLayer({
            canvas
        });
        // xian 
        this.line = new LineLayer({
            canvas
        });
        // arrow
        this.arrow = new ArrowLayer({
            canvas
        });
        this.initOn();
    }
    /**
     *  监听重绘
     */
    initOn() {
        this._on('clearCanvas', this.clearCanvas, this);
        this._on('addPolygonVertex', this.addPolygonVertex, this);
        this._on('addLocToCoordinate', this.addLocToCoordinate, this);
        this._on('changePolygon', this.changePolygon, this);
        this._on('layersMove', this.layersMove, this)

    }

    clearCanvas() {

        this._clearCanvas();
        this.imageLayer && this.imageLayer.drawImage();
    }
    /**
     * 多边形增加一个定点信息
     * @param {*} param0 
     */
    addPolygonVertex({ pathId, dot, index }) {
        const [checkedInfo] = this.coordinates.filter(val => val.pathId == pathId);
        if (checkedInfo) {
            const [x, y] = this._formateDotBase(dot);
            checkedInfo.paths.splice(index, 0, [x, y]);
        }
    }
    /**
     * 将当前点信息存储到coordinate数组中
     * @param {*} loc 
     */
    addLocToCoordinate(loc) {
        this.coordinate.push(this._formateDotBase(loc));
    }

    /**
     * 修改多边形 或者矩形定点信息
     * @param {*} param0 
     */
    changePolygon({ index, loc, pathId }) {
        const [checkedInfo] = this.coordinates.filter(val => val.pathId == pathId);
        if (checkedInfo && checkedInfo.paths) {
            const paths = checkedInfo.paths || [];
            paths[index] = this._formateDotBase(loc);
        }
    }
    /**
     * 判断是拖拽图片 还是移动图形
     */
    layersMove(flag, loc) {
        this.layersMoveFlag = flag;

        if (!flag) {
            // 图片移动
            const [x = 0, y = 0] = this._formateDotBase(loc);

            this.coordinate = this.coordinate.filter(val => {
                return !(val[0] == x && val[1] == y)
            });
        }
    }
    /**
     * 更改当前图形绘制类型
     */
    changeDrawType(type) {
        this.drawType = type;

    }

    drawLayerEnd() {
        this.clearCanvas();
        this.coordinates.push({
            pathId,
            paths: this.coordinate,
            type: this.drawType
        });
        this.coordinate = [];
        this.layersMoveFlag = true;
        pathId++;
        this.getDiffDrawTypeInfo();
        const coordinates = this.coordinates.filter(val => val.type == this.drawType);
        this._emit('drawEnd', this.drawType, coordinates, this.coordinate);
    }
    // 渲染除当前绘制状态外的不同形状

    getDiffDrawTypeInfo() {
        const coordinates = this.coordinates || [];
        const drawTypeList = this.drawTypeList.filter(val => val != this.drawType);
        const tempMap = {};
        drawTypeList.forEach(type => {
            tempMap[type] = coordinates.filter(val => val.type == type)
        })
        Object.keys(tempMap).forEach(key => {
            const layer = this[key] || {};
            if (layer.imageDargEndCallback) {
                layer.imageDargEndCallback(tempMap[key]);
            }
        })
    }


    // add canvasDom events
    initEvents($canvasDom) {

        $canvasDom.addEventListener('mousedown', (e) => {

            this.clearCanvas();
            this.getDiffDrawTypeInfo();
            this.handleCanvasMousedown(e);
        });
        $canvasDom.addEventListener('mousemove', (e) => {

            this.clearCanvas();
            this.getDiffDrawTypeInfo();
            this.handleCanvasMousemove(e);
        });
        $canvasDom.addEventListener('mouseup', (e) => {

            // this.clearCanvas();
            // this.getDiffDrawTypeInfo();
            this.handleCanvasMouseup(e);
        });
        $canvasDom.addEventListener('mousewheel', (e) => {

            this.clearCanvas();
            this.getDiffDrawTypeInfo();
            this.handleCanvasMousewheel(e);
        });
        $canvasDom.addEventListener('dblclick', (e) => {
            this.handleCanvasDbClick(e);
        })


    }

    handleCanvasMousedown(e) {
        e.stopPropagation();
        e.preventDefault();
        this.imageLayer.mouseDownStart(e);
        const loc = this._windowToCanvas(event.clientX, event.clientY, this._canvas);
        this.wrapOffsetX = loc[0];
        this.wrapOffsetY = loc[1];
        this.currentLoc = loc;
        const coordinates = this.coordinates.filter(val => val.type == this.drawType);
        this[this.drawType] && this[this.drawType].mouseDown(coordinates, this.coordinate, loc);

    }

    handleCanvasMousemove(e) {
        e.stopPropagation();
        e.preventDefault();
        const loc = this._windowToCanvas(e.clientX, e.clientY, this._canvas);
        this.currentLoc = loc;
        const coordinates = this.coordinates.filter(val => val.type == this.drawType);

        if (e.buttons == 1) {





            // 拖拽
            if (!this.layersMoveFlag) {
                this.imageLayer.mouseDownMove(e).then(() => {
                    this.layersMoveFlag = true;
                    this.getDiffDrawTypeInfo();
                    this[this.drawType] && this[this.drawType].imageDargEndCallback(coordinates, this.coordinate, loc);

                });

                this._canvas.addEventListener('mouseup', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    const loc = this._windowToCanvas(e.clientX, e.clientY, this._canvas);
                    const diffX = loc[0] - this.wrapOffsetX;
                    const diffY = loc[1] - this.wrapOffsetY;
                    if ((Math.abs(diffX) > this.dragThreshold || Math.abs(diffY) > this.dragThreshold)) {
                        if (this.drawType == 'ploygon') {
                            this[this.drawType] && this[this.drawType].mouseDown(coordinates, this.coordinate, loc);
                        }
                    }

                })

            } else {
                this[this.drawType] && this[this.drawType].mouseMoveDrag(coordinates, this.coordinate, loc);
            }


        } else {

            // 非拖拽  可能在绘制图形
            this[this.drawType] && this[this.drawType].mouseMove(coordinates, this.coordinate, loc);

        }
    }

    handleCanvasMousewheel(e) {
        e.stopPropagation();
        e.preventDefault();
        if (e.wheelDelta > 0) {
            this.imageLayer.operateImageSize('amplification', e);
        } else {
            this.imageLayer.operateImageSize('reduce', e);
        }
        const coordinates = this.coordinates.filter(val => val.type == this.drawType);

        this[this.drawType] && this[this.drawType].imageDargEndCallback(coordinates, this.coordinate, this.currentLoc);

    }

    handleCanvasMouseup(e) {
        e.stopPropagation();
        e.preventDefault();
        this._emit('eidtEnd');
        if (this.drawType == 'rect' || this.drawType == 'line' || this.drawType == 'arrow') {
            if (this.coordinate.length == 2) {
                this.drawLayerEnd();
            }
        }
        console.log(e.buttons, 'up');

    }



    handleCanvasDbClick(e) {
        e.stopPropagation();
        e.preventDefault();
        if (this.drawType === 'polygon') {

            if (this.coordinate.length > 2) {
                this.drawLayerEnd();
            } else {
                throw ('小于两个点不能存储')
            }
        }

    }
}



export default Brush;