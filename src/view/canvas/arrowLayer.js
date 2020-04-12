import BaseCanvas from './baseCanvas';

import { calcArrowH } from './util';

class ArrowLayers extends BaseCanvas {
    constructor({ canvas, layersOptions }) {
        super(canvas);
        if (canvas) {
            this.threshold = 10;
            this.arrowLength = 20;
            this.theta = 30;
            this.editFlag = false;
            this._type = 'arrow';
            this.editPos = {};
            this.coordinate = [];
            this.coordinates = [];
            this.checkedIndex = -1;
            this._initOn();
            this.initCanvasOptions(canvas, layersOptions);
        }
    }

    _initOn = () => {
        this._on('eidtEnd', this.eidtEnd, this);
        this._on('drawEnd', this.drawEnd, this);
        this._on('setCheckedInfo', this.setCheckedInfo, this);
    };

    eidtEnd = () => { };
    drawEnd = (type, coordinates, coordinate) => {
        if (type == this._type) {
            this.imageDargEndCallback(coordinates, coordinate);
        }
    };
    setCheckedInfo = info => {
        if (info) {
            const { type, pathId } = info;
            if (type == this._type) {
                this.checkedIndex = pathId;
            } else {
                this.checkedIndex = -1;
            }
        } else {
            this.checkedIndex = -1;
        }

        this.drawArrow();
    };

    _drawArrow = (loc1, loc2, strokeFlag = true) => {
        if (loc1 && loc2) {
            // 绘制直线
            this._context.lineWidth = 5;
            this._context.beginPath();
            this._context.moveTo(loc1[0], loc1[1]);
            this._context.lineTo(loc2[0], loc2[1]);
            // 绘制箭头

            const [h1, h2] = calcArrowH(loc1, loc2);

            this._context.moveTo(h1[0], h1[1]);
            this._context.lineTo(loc2[0], loc2[1]);

            this._context.lineTo(h2[0], h2[1]);
            if (strokeFlag) {
                this._context.strokeStyle = this.strokeColor;
                this._context.stroke();
            }
        }
    };

    _drawCheckedArrow = (loc1, loc2) => {
        if (loc1 && loc2) {
            // 绘制直线
            this._context.lineWidth = 5;
            this._context.beginPath();
            this._context.moveTo(loc1[0], loc1[1]);
            this._context.lineTo(loc2[0], loc2[1]);
            // 绘制箭头

            const [h1, h2] = calcArrowH(loc1, loc2);

            this._context.moveTo(h1[0], h1[1]);
            this._context.lineTo(loc2[0], loc2[1]);

            this._context.lineTo(h2[0], h2[1]);
            this._context.strokeStyle = this.strokeColor;
            this._context.stroke();
            this._context.save();
            this._context.lineWidth = 2;
            this._context.strokeColor = this.fillColor;
            this._context.fillColor = this.strokeColor;
            this._drawCircle(loc1, this.strokeColor, this.fillColor);
            this._drawCircle(loc2, this.strokeColor, this.fillColor);
            this._drawCircle(h1, this.strokeColor, this.fillColor);
            this._drawCircle(h2, this.strokeColor, this.fillColor);
            this._context.restore();
        }
    };

    /**
     * return 返回当前点是否在路径中(路径中)
     * @param {*} coordinates 
     * @param {*} currentPoint 
     */
    _isPointInPath(coordinates, currentPoint) {
        for (let i = coordinates.length - 1; i > -1; --i) {
            const paths = coordinates[i].paths || [];
            if (this.judgeDotIsInPath(currentPoint, paths, this.threshold)) {
                return i;
            }
        }
        return -1;
    }

    drawArrow = loc => {
        const coordinates = this.coordinates || [];
        const coordinate = this.coordinate || [];
        coordinates &&
            coordinates.forEach(val => {
                const paths = val.paths || [];
                const pathId = val.pathId;
                const [loc1, loc2] = paths || [];
                if (this.checkedIndex == pathId) {
                    this._drawCheckedArrow(loc1, loc2);
                } else {
                    this._drawArrow(loc1, loc2);
                }
            });

        if (coordinate) {
            if (coordinate.length == 1 && loc) {
                this._drawArrow(coordinate[0], loc);
            } else if (coordinate.length == 2) {
                this._drawArrow(coordinate[0], coordinate[1]);
            }
        }
    };

    mouseDown = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this._emit('addLocToCoordinate', pos);
        this.drawArrow(pos);
    };
    mouseMove = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawArrow(pos);
    };

    mouseMoveDrag = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawArrow(pos);
    };

    imageDargEndCallback = (coordinates = [], coordinate = []) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawArrow();
    };
}

export default ArrowLayers;
