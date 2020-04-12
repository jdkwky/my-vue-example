import BaseEvent from './eventBus'

class BaseCanvas extends BaseEvent {

    constructor() {
        super();
        // BaseCanvas.prototype._canvas = canvas;
        // BaseCanvas.prototype._context = this._canvas && this._canvas.getContext('2d');
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;
        this.strokeColor = 'blue';
        this.fillColor = 'rgba(255,255,255,0.2)'

        this._initOn();
    }

    _initOn() {
        this._on('changeImgProps', this.changeImgProps, this);
        this._on('initCanvasOptions', this.initCanvasOptions, this);
    }
    /**
     * 给canvas context canvas 绘图环境赋值
     */
    initCanvasOptions = (canvas, layersOptions) => {

        BaseCanvas.prototype._canvas = canvas;

        BaseCanvas.prototype._context = this._canvas && this._canvas.getContext('2d');

        const { fillColor = this.fillColor, strokeColor = this.strokeColor } = layersOptions || {};
        BaseCanvas.prototype.fillColor = fillColor;
        BaseCanvas.prototype.strokeColor = strokeColor;

    }

    /**
     * 重置当前放大缩小倍数或者拖动距离
     * @param {*} param0 
     */
    changeImgProps = ({ scale, offsetX, offsetY }) => {
        this.scale = scale || 1;
        this.offsetX = offsetX || 0;
        this.offsetY = offsetY || 0;

    }

    // 将坐标转化成相对canvas画布左边
    _windowToCanvas = (x, y) => {
        const bbox = this._canvas.getBoundingClientRect(); // 获取canvas元素的边界框
        return [
            x - bbox.left * (this._canvas.width / bbox.width),
            y - bbox.top * (this._canvas.height / bbox.height)
        ];
    }

    /**
   * 清空画布公共方法
   */
    _clearCanvas = () => {
        this._context.clearRect(0, 0, this._canvas.width, this._canvas.height);
        return this;
    }
    /**
     * 将相对图片的基础值转化成拖拽放大或者缩小之后想对于基础数据的值
     * @param {*} scale 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} dot 
     */
    _formateDotScale = (dot = []) => {
        const [x, y] = dot;
        const newX = x * this.scale + this.offsetX;
        const newY = y * this.scale + this.offsetY;

        return [
            newX,
            newY
        ];
    }
    /**
     * 将当前点坐标转换成相对于原始图片的尺寸的坐标大小
     * @param {*} scale 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} dot 
     */
    _formateDotBase = (dot = []) => {
        const [x, y] = dot;
        const newX = (x - this.offsetX) / this.scale;
        const newY = (y - this.offsetY) / this.scale;
        return [
            newX,
            newY
        ];
    }

    /**
     * 将数组转化成放大或者缩小之后的数组
     * @param {*} scale 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} coordinates 
     */

    formateCoordinatesScale(coordinates = []) {
        const coordinates1 = [];
        coordinates.forEach(coordinate => {
            const map = {
                ...coordinate,
                paths: coordinate.paths.map(val => this._formateDotScale(val))
            }
            coordinates1.push(map);
        });
        return coordinates1;
    }
    /**
     * 将当前绘制数组 转换成放大或者缩小之后的数组
     * @param {*} scale 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} coordinate 
     */
    formateCoordinateScale(coordinate = []) {

        return coordinate.map(val => this._formateDotScale(val))
    }


}



export default BaseCanvas;