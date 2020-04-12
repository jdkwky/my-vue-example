import BaseCanvas from './baseCanvas';

class LineLayers extends BaseCanvas {
    constructor({ canvas, layersOptions }) {
        super(canvas);
        if (canvas) {
            this.threshold = 10;
            this.editFlag = false;
            this.editPos = {};
            this.checkedIndex = -1;
            this.coordinate = [];
            this.coordinates = [];
            this._type = 'line';
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
        this.drawLine();
    };

    _drawLine = (loc1, loc2, strokeFlag = true) => {
        if (loc1 && loc2) {
            // 绘制直线
            this._context.lineWidth = 5;
            this._context.beginPath();
            this._context.moveTo(loc1[0], loc1[1]);
            this._context.lineTo(loc2[0], loc2[1]);
            if (strokeFlag) {
                this._context.strokeStyle = this.strokeColor;
                this._context.stroke();
            }
        }
    };

    _drawCheckedLine = (loc1, loc2) => {
        if (loc1 && loc2) {
            // 绘制直线
            this._context.lineWidth = 5;
            this._drawLine(loc1, loc2);
            this._context.save();
            this._context.lineWidth = 2;
            this._context.strokeColor = this.fillColor;
            this._context.fillColor = this.strokeColor;
            this._drawCircle(loc1, this.strokeColor, this.fillColor);
            this._drawCircle(loc2, this.strokeColor, this.fillColor);
            this._context.restore();
        }
    };

    drawLine = loc => {
        const coordinates = this.coordinates || [];
        const coordinate = this.coordinate || [];
        coordinates &&
            coordinates.forEach(val => {
                const paths = val.paths || [];
                const pathId = val.pathId;
                const [loc1, loc2] = paths || [];
                if (this.checkedIndex == pathId) {
                    this._drawCheckedLine(loc1, loc2);
                } else {
                    this._drawLine(loc1, loc2);
                }
            });

        if (coordinate) {
            if (coordinate.length == 1 && loc) {
                this._drawLine(coordinate[0], loc);
            } else if (coordinate.length == 2) {
                this._drawLine(coordinate[0], coordinate[1]);
            }
        }
    };

    mouseDown = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this._emit('addLocToCoordinate', pos);
        this.drawLine(pos);
    };
    mouseMove = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawLine(pos);
    };

    mouseMoveDrag = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawLine(pos);
    };

    imageDargEndCallback = (coordinates = [], coordinate = []) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawLine();
    };
}

export default LineLayers;
