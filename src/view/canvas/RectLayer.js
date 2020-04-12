import BaseCanvas from './baseCanvas';

class Rect extends BaseCanvas {

    constructor() {
        super();
        this.threshold = 5;
        this.circleRadius = 3;
        this.editFlag = false;
        this.editPos = {};
        this.checkedIndex = -1;
        this._initOn();

    }

    _initOn = () => {
        this._on('eidtEnd', this.eidtEnd, this);
        this._on('drawEnd', this.drawEnd, this);
    }

    eidtEnd = () => {
        this.editPos = {};
    }
    drawEnd = (type, coordinates, coordinate) => {

        if (type == 'rect') {
            this.coordinates = this.formateCoordinatesScale(coordinates);
            this.coordinate = this.formateCoordinateScale(coordinate);
            this.clearFlag();
            this.drawRect();
        }
    }

    // 清空绘制状态
    clearFlag = () => {
        this.editFlag = false;
        this.checkedIndex = -1;
        this.editPos = {};
    }

    /**
     * 获取最近点
     */
    _judgeNearLeastDot = (posList, pos) => {

        const pos0 = posList[0];
        const pos1 = posList[1];
        const x0 = pos0[0];
        const x1 = pos1[0];
        const y0 = pos0[1];
        const y1 = pos1[1];
        const x = pos[0];
        const y = pos[1];
        if ((y <= y1 && y >= y0) || (y <= y0 && y >= y1)) {
            if (Math.abs(x0 - x) <= this.threshold) {
                this.editPos = { index: 0, value: 0 };
                this.editFlag = true;

                this.drawEditRect(this.checkedIndex, [x0, pos[1]]);

                return;
            } else if (Math.abs(x1 - x) <= this.threshold) {
                this.editPos = { index: 1, value: 0 };
                this.editFlag = true;
                this.drawEditRect(this.checkedIndex, [x1, pos[1]]);
                return;
            }
        }
        if ((x >= x0 && x <= x1) || (x >= x1 && x <= x0)) {
            if (Math.abs(y0 - y) <= this.threshold) {
                this.editPos = { index: 0, value: '1' };
                this.editFlag = true;
                this.drawEditRect(this.checkedIndex, [pos[0], y0]);
                return;
            } else if (Math.abs(y1 - y) <= this.threshold) {
                this.editPos = { index: 1, value: '1' };
                this.editFlag = true;
                this.drawEditRect(this.checkedIndex, [pos[0], y1]);
                return;
            }
        }
        this.editPos = {}
        this.drawEditRect(this.checkedIndex);
    }

    _isPointInPath = (pos) => {
        const coordinates = this.coordinates || [];
        for (let i = coordinates.length - 1; i > -1; i--) {
            const [pos1, pos2] = coordinates[i] && coordinates[i].paths;

            this._context.beginPath();
            this._context.rect(pos1[0], pos1[1], pos2[0] - pos1[0], pos2[1] - pos1[1]);
            if (this._context.isPointInPath(pos[0], pos[1])) {
                return i;
            }
            if (this._context.isPointInPath(pos[0] + this.threshold, pos[1])) {
                return i;
            }
            if (this._context.isPointInPath(pos[0], pos[1] + this.threshold)) {
                return i;
            }
            if (this._context.isPointInPath(pos[0] + this.threshold, pos[1] + this.threshold)) {
                return i;
            }
            if (this._context.isPointInPath(pos[0] - this.threshold, pos[1])) {
                return i;
            }
            if (this._context.isPointInPath(pos[0] - this.threshold, pos[1] - this.threshold)) {
                return i;
            }
            if (this._context.isPointInPath(pos[0] + this.threshold, pos[1] + this.threshold)) {
                return i;
            }
        }

        return -1;
    }

    _drawRect = (x, y, width, height, fillFlag) => {
        this._context.lineWidth = 1;
        this._context.beginPath();
        this._context.strokeStyle = this.strokeColor;
        this._context.rect(x, y, width, height);
        this._context.stroke();
        if (fillFlag) {
            this._context.fillStyle = this.fillColor;
            this._context.fill();
        }
    }

    _drawCircle(pos, strokeColor, fillColor) {
        this._context.lineWidth = 1;
        this._context.beginPath();
        this._context.strokeStyle = strokeColor || this.strokeColor;
        this._context.arc(pos[0], pos[1], this.circleRadius, 0, 2 * Math.PI, true);
        this._context.stroke();
        this._context.fillStyle = fillColor || this.fillColor;
        this._context.fill();
    }

    drawAlreadyRect() {

        if (this.coordinates.length > 0) {
            this.coordinates && this.coordinates.forEach((posInfo, index) => {
                const posList = posInfo.paths || [];
                const pos0 = posList[0] || [];
                const pos1 = posList[1] || [];
                const x0 = pos0[0];
                const y0 = pos0[1];
                const x1 = pos1[0];
                const y1 = pos1[1];
                this._drawRect(x0, y0, x1 - x0, y1 - y0, true);

                if (this.checkedIndex === index) {
                    // 被选中的矩形
                    const pos2 = [x0, y1];
                    const pos3 = [x1, y0];
                    const strokeColor = this.fillColor;
                    const fillColor = this.strokeColor;
                    this._drawCircle(pos0, strokeColor, fillColor);
                    this._drawCircle(pos1, strokeColor, fillColor);
                    this._drawCircle(pos2, strokeColor, fillColor);
                    this._drawCircle(pos3, strokeColor, fillColor);
                }
            })
        }
    }

    drawRect = () => {
        this.drawAlreadyRect();
        const coordinate = this.coordinate || [];
        if (coordinate.length == 1) {
            const pos = coordinate[0];
            this._drawRect(pos[0], pos[0], 0, 0);
        } else if (coordinate.length == 2) {
            const pos0 = coordinate[0] || {};
            const pos1 = coordinate[1] || {};
            const x0 = pos0[0];
            const y0 = pos0[1];
            const x1 = pos1[0];
            const y1 = pos1[1];
            this._drawRect(x0, y0, x1 - x0, y1 - y0);
        }
    };

    drawMoveRect = (pos) => {

        this.drawAlreadyRect();
        const coordinate = this.coordinate || [];

        if (coordinate.length == 1 && pos) {
            const pos0 = coordinate[0] || [];
            const x0 = pos0[0];
            const y0 = pos0[1];
            const x1 = pos[0];
            const y1 = pos[1];
            this._drawRect(x0, y0, x1 - x0, y1 - y0);
        }
    };


    drawEditRect(checkedIndex, pos) {
        this.coordinates && this.coordinates.forEach((posInfo, index) => {
            const posList = posInfo.paths;
            if (posList.length == 2) {
                const pos0 = posList[0] || [];
                const pos1 = posList[1] || [];
                const x0 = pos0[0];
                const y0 = pos0[1];
                const x1 = pos1[0];
                const y1 = pos1[1];
                this._drawRect(x0, y0, x1 - x0, y1 - y0, true);
                if (checkedIndex == index) {
                    const pos2 = [x0, y1];
                    const pos3 = [x1, y0];
                    const strokeColor = this.fillColor;
                    const fillColor = this.strokeColor;
                    this._drawCircle(pos0, strokeColor, fillColor);
                    this._drawCircle(pos1, strokeColor, fillColor);
                    this._drawCircle(pos2, strokeColor, fillColor);
                    this._drawCircle(pos3, strokeColor, fillColor);
                    if (pos) {
                        this._drawCircle(pos);
                    }
                }
            }

        })

    }

    getDurationPoints(points) {
        const xList = points.map(val => val[0]);
        const yList = points.map(val => val[1]);
        const xMin = Math.min(...xList);
        const xMax = Math.max(...xList);
        const yMin = Math.min(...yList);
        const yMax = Math.max(...yList);
        return {
            xMin,
            xMax,
            yMin,
            yMax
        };
    }



    mouseDown = (coordinates, coordinate, pos) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        const checkedIndex = this._isPointInPath(pos);
        this.checkedIndex = checkedIndex;

        if (checkedIndex > -1) {
            this.editFlag = true;

            if (this.coordinate.length === 1) {
                this.preAddLoc = pos;
                this._emit('addLocToCoordinate', pos);
                this.eidtEnd();
                this.drawMoveRect(pos);
            } else {
                // 选中
                this._judgeNearLeastDot(this.coordinates[checkedIndex].paths, pos);

                // this.drawMoveRect(pos);
            }

        } else {
            if (this.coordinate.length < 2) {
                this.preAddLoc = pos;
                this._emit('addLocToCoordinate', pos);
                this.eidtEnd();
                this.drawMoveRect(pos);
            } else {
                this.drawRect();
            }
        }


    };
    mouseMove = (coordinates, coordinate, pos) => {

        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        if (this.coordinate.length == 1) {
            this.drawMoveRect(pos);
            return;
        }
        if (this.checkedIndex > -1) {

            this._judgeNearLeastDot(this.coordinates[this.checkedIndex].paths, pos);
            // this.drawMoveRect(pos);
            return;
        }
        this.drawMoveRect();
    };

    mouseMoveDrag = (coordinates, coordinate, pos) => {

        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);


        if (this.editFlag) {
            if (this.checkedIndex > -1 && Object.keys(this.editPos).length > 0) {

                const { index, value } = this.editPos;
                const pathId = this.coordinates[this.checkedIndex] && this.coordinates[this.checkedIndex].pathId;
                const checkedPaths = this.coordinates[this.checkedIndex] && this.coordinates[this.checkedIndex].paths || [];
                const editPaths = checkedPaths[index];
                const newPos = value == 0 ? [pos[value], editPaths[1]] : [editPaths[0], pos[1]]
                this._emit('changePolygon', { index, pathId, loc: newPos });
                editPaths[value] = pos[value];
                // 防止点在延长线上动
                const { xMin, xMax, yMin, yMax } = this.getDurationPoints(checkedPaths);
                if (pos[0] < xMin) {
                    pos[0] = xMin;
                } else if (pos[0] > xMax) {
                    pos[0] = xMax;
                } else if (pos[1] < yMin) {
                    pos[1] = yMin;
                } else if (pos[1] > yMax) {
                    pos[1] = yMax;
                }
                this.drawEditRect(this.checkedIndex, pos);
                this._emit('layersMove', true);

            } else {
                this.drawRect();
            }
        } else {
            this.drawEditRect(this.checkedIndex);
            this._emit('layersMove', false, this.preAddLoc);
        }
    }

    imageDargEndCallback = (coordinates = [], coordinate = []) => {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.drawRect();
    }


}


export default Rect;