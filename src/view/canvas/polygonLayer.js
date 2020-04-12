import BaseCanvas from './baseCanvas';

class PolygonLayer extends BaseCanvas {
    constructor(
        {
            canvas
        }
    ) {
        super(canvas)
        if (canvas) {
            this._canvas = canvas;
            this._context = this._canvas.getContext('2d');
            this.coordinates = [];
            this.coordinate = [];
            this.fillColor = "rgba(255,255,255,0.2)";
            this.strokeColor = "blue";
            this.circleRadius = 3;
            this.currentCheckedInfo = {};
            this._initOn();
            this.threshold = 10;
            this.moveLayersFlag = false;



        } else {
            console.error('polygonLayer need canvas');
        }
    }
    _initOn = () => {
        this._on('eidtEnd', this.eidtEnd, this);
        this._on('drawEnd', this.drawEnd, this)
    }

    drawEnd = (type, coordinates, coordinate) => {
        if (type == 'polygon') {
            this.coordinates = this.formateCoordinatesScale(coordinates);
            this.coordinate = this.formateCoordinateScale(coordinate);
            this.clearFlag();
            this.createMovePolygonPath();
        }
    }

    eidtEnd = () => {
        this.currentCheckedInfo = {};
        this.moveLayersFlag = false;
    }
    clearFlag = () => {
        this.currentCheckedInfo = {};
        this.moveLayersFlag = false;
        this.checkedIndex = -1;
    }
    /**
     * 重置绘图状态
     * @param {*} param0 
     */
    setContextProps({
        fillColor,
        strokeColor,

    }) {
        this.fillColor = fillColor || this.fillColor;
        this.strokeColor = strokeColor || this.strokeColor;
    }

    /**
     *
     * @param {*} points
     * @param {*} currentPoint
     * @param {*} zoom
     * @param {*} diffX
     * @param {*} diffY
     * return 返回当前点是否在路径中(路径中)
     */
    isPointInPath(coordinates, currentPoint) {
        this._context.beginPath();
        this._context.moveTo(coordinates[0][0], coordinates[0][1]);
        for (let i = coordinates.length - 1; i > -1; --i) {
            this._context.lineTo(coordinates[i][0], coordinates[i][1]);
        }
        this._context.closePath();
        if (this._context.isPointInPath(currentPoint[0], currentPoint[1])) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0] - this.threshold, currentPoint[1])) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0] - this.threshold, currentPoint[1] - this.threshold)) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0] + this.threshold, currentPoint[1])) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0] + this.threshold, currentPoint[1] + this.threshold)) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0], currentPoint[1] - this.threshold)) {
            return true;
        }
        if (this._context.isPointInPath(currentPoint[0], currentPoint[1] + this.threshold)) {
            return true;
        }
    }

    /**
     * 将一组多边形中的线段两两连线
     * @param {Object} points
     */
    getLinePath(points) {
        const lines = [];
        for (let i = 0, len = points.length; i < len; i++) {
            if (i < len - 1) {
                lines.push({
                    p1: [points[i][0], points[i][1]],
                    p2: [points[i + 1][0], points[i + 1][1]]
                });
            } else {
                lines.push({
                    p1: [points[i][0], points[i][1]],
                    p2: [points[0][0], points[0][1]]
                });
            }
        }
        return lines;
    }

    /**
     * 判断鼠标点靠近哪个点
     * @param {Point} dot
     * @param {List} coordinates
     * @param { Number } checkedIndex
     * 
     */
    judgeNearLeastDot(checkedIndex, dot) {
        const { paths, pathId } = this.coordinates[checkedIndex];
        const currentLines = this.getLinePath(paths);

        const results = [];
        const resultsMap = {};
        for (let i = 0, len = currentLines.length; i < len; i++) {
            const x2 = dot[0] ? dot[0] : 0;
            const y2 = dot[1] ? dot[1] : 0;
            const p1 = currentLines[i].p1;
            const p2 = currentLines[i].p2;
            const [p1X, p1Y] = p1;
            const [p2X, p2Y] = p2;
            let l = this.threshold + 1;
            let x = 0;
            let y = 0;
            if (
                ((p1X <= x2 && x2 <= p2X) || (p2X <= x2 && x2 <= p1X)) &&
                ((p1Y <= y2 && y2 <= p2Y) || (p2Y <= y2 && y2 <= p1Y))
            ) {
                const slop = this.calSlop(p1, p2);
                const verSlop = this.calVerticalSlop(slop);

                const x1 = p1[0] || 0;
                const y1 = p1[1] || 0;

                if (slop != 0 && verSlop != 0) {
                    if (y2 == slop * x2 + y1 - slop * y1) {
                        // 点在当前直线上
                        x = x2;
                        y = y2;
                    } else {
                        x = parseFloat((y2 - y1 + slop * x1 - verSlop * x2) / (slop - verSlop));
                        y = parseFloat(slop * x + y1 - slop * x1);
                    }
                } else {
                    // 垂直于x轴或平行于x轴
                    if (x1 == p2X) {
                        // 平行于y轴
                        x = x1;
                        y = y2;
                    } else if (y1 == p2Y) {
                        // 平行于x轴
                        x = x2;
                        y = y1;
                    }
                }


                if (
                    (p1X <= x && x <= p2X) ||
                    (p2X <= x && x <= p1X && (p1Y <= y && y <= p2Y)) ||
                    (p2Y <= y && y <= p1Y)
                ) {
                    l = parseInt(Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2)));
                }
            } else {
                l = parseInt(Math.sqrt(Math.pow(x2 - p1X, 2) + Math.pow(y2 - p1Y, 2)));
            }

            // x y 焦点
            let vertex = -1;

            if (l < this.threshold) {
                // 说明是点在线上
                const l1 = parseInt(Math.sqrt(Math.pow(p1X - x2, 2) + Math.pow(p1Y - y2, 2)));
                const l2 = parseInt(Math.sqrt(Math.pow(p2X - x, 2) + Math.pow(p2Y - y, 2)));
                if (l1 < this.threshold) {
                    x = p1X;
                    y = p1Y;
                    vertex = 0;
                } else if (l2 < this.threshold) {
                    x = p2X;
                    y = p2Y
                    vertex = 1;
                }
            }

            results.push(l);
            resultsMap[l] = {
                index: i,
                value: l,
                dot: [
                    x,
                    y
                ],
                checkedIndex,
                vertex,
                pathId
            };
        }

        if (results.length > 0) {
            const min = Math.min(...results);

            return resultsMap[min];
        }
        return null;
    }

    /**
     * 计算靠近两个点的斜率
     *
     * @param {Point} line1
     * @param {Point} line2
     */
    calSlop(line1, line2) {
        if (line1[0] - line2[0] != 0) {
            return parseFloat((line1[1] - line2[1]) / (line1[0] - line2[0]));
        }
        return 0;
    }
    /**
     * 计算垂线的斜率
     * @param {Number} slop
     */
    calVerticalSlop(slop) {
        if (slop != 0) {
            return parseFloat(-1 / slop);
        }
        return 0;
    }

    /**
     * 计算点是否在线左右  阈值可设置
     * 
     * @param { List<Point> } coordinates
     * @param { Number } checkedIndex
     * @param diffX 底层差值x
     * @param diffY  底层差值y
     */

    calcDotNearLine(coordinates, checkedIndex, dot) {
        //判断此点距离哪个点最近
        if (coordinates.length > 0) {
            const result = this.judgeNearLeastDot(checkedIndex, dot, 10);
            if (result && result.value <= this.threshold) {
                return result;
            }
        }
        return {};
    }

    /**
     * 将编辑图形时产生的点放入到大数组中  修改了数据信息
     *
     * params
     *
     */
    editPoints(currentCheckedInfo) {

        const checkedIndex = currentCheckedInfo.checkedIndex;
        // 第几条线
        const index = currentCheckedInfo.index;
        const dot = currentCheckedInfo.dot;
        const vertex = currentCheckedInfo.vertex;
        let checkDotIndex = index + vertex;
        if (vertex == -1) {
            // 说明不是个顶点

            this.coordinates[checkedIndex].paths.splice(index + 1, 0, [dot[0], dot[1]]);
            this._emit('addPolygonVertex', {
                pathId: currentCheckedInfo.pathId,
                dot,
                index: index + 1
            });
            checkDotIndex = index + 1;
        }
        // 重绘
        this.drawAllCheckedPath(checkDotIndex, checkedIndex);
        return this;
    }

    /**
 * 鼠标移动时将点数据动态更新到数组中  修改了数据信息
 *
 * params
 */
    editMovePoints(currentCheckedInfo, loc) {

        const checkedIndex = currentCheckedInfo.checkedIndex;
        // 第几条线
        const index = currentCheckedInfo.index;
        const vertex = currentCheckedInfo.vertex;
        const pathId = currentCheckedInfo.pathId;

        let checkDotIndex = vertex + index;
        const checkedCoordinate = this.coordinates[checkedIndex].paths;
        if (vertex == -1) {
            // 说明不是个顶点
            checkedCoordinate[index + 1] = loc;
            this._emit('changePolygon', {
                index: index + 1,
                loc,
                isVertex: false,
                pathId
            });
            checkDotIndex = index + 1;
        } else {
            // 说明是个顶点
            const i = index + vertex;
            checkedCoordinate[i] = loc;
            this._emit('changePolygon', {
                index: i,
                loc,
                isVertex: true,
                pathId
            });

        }

        // 重绘
        this.drawAllCheckedPath(
            checkDotIndex,
            checkedIndex,
        );
        return this;
    }

    /**
     * 绘制非编辑状态情况下路径
     *
     * checkedIndex: 当前选中的路径
     * checkDotIndex : 当前选中的点左边
     *
     */
    drawAllCheckedPath(checkDotIndex, checkedIndex) {

        if (this.coordinates.length > 0) {
            this.coordinates.forEach((val, index) => {
                if (checkedIndex != index) {
                    this.drawPath(val.paths, true, true);
                } else {
                    this.drawCheckedPath(
                        val.paths,
                        checkDotIndex,
                    );
                }
            });
        }
        return this;
    }

    /**
     * 绘制多边形路径
     * @param {Array} coordinates
     * @param {Boolean} flag
     * @param {Boolean} fill
     * @param { String } fillColor
     * @param { String } strokeColor
     */
    drawPath(
        coordinates,
        flag,
        fill,
    ) {
        if (coordinates.length > 0) {
            this._context.lineWidth = 1;
            this._context.beginPath();
            this._context.moveTo(coordinates[0][0], coordinates[0][1]);

            for (let i = 1; i < coordinates.length; ++i) {

                this._context.lineTo(coordinates[i][0], coordinates[i][1]);

            }
            if (flag) {
                this._context.closePath();
            }

            this._context.strokeStyle = this.strokeColor;

            this._context.stroke();
            if (fill) {

                this._context.fillStyle = this.fillColor;
                this._context.fill();
            }
        }
        return this;
    }

    /**
     * 绘制当前数据路径
     * @param {*} params 
     */
    createPolygonPath() {
        if (this.coordinates.length > 0) {
            const index = this.currentCheckedInfo.index;
            const vertex = this.currentCheckedInfo.vertex;
            let checkDotIndex = null;
            if (vertex > -1) {
                checkDotIndex = vertex + index;
            }
            this.drawAllCheckedPath(checkDotIndex, this.checkedIndex);
        }
        if (this.coordinate.length > 0) {
            this.drawPath(this.coordinate, false, false);
        }
        return this;
    }

    /**
     * 绘制状态下鼠标move状态下画图
     *  loc: 当前鼠标点位置
     */
    createMovePolygonPath(loc) {
        this.createPolygonPath();
        if (this.coordinate.length > 0) {
            if (loc) {
                this._context.lineTo(loc[0], loc[1]);
                this._context.closePath();

                this._context.stroke();
            }
        }
        return this;
    }

    /**
     *绘制正常状态中的选中图形状态
     * @param {List} points
     * @param { Number } checkDotIndex
     * @param { String } fillColor
     * @param { String } strokeColor
     */

    drawCheckedPath(points, checkDotIndex) {
        // 画线段
        this.drawPath(points, true, true);
        for (let i = 0; i < points.length; ++i) {
            this._context.beginPath();
            this._context.moveTo(points[i][0], points[i][1]);
            if (checkDotIndex != i) {
                this._context.strokeStyle = this.strokeColor;
                this._context.arc(points[i][0], points[i][1], this.circleRadius, 0, 2 * Math.PI, true);
                this._context.fillStyle = 'white';
                this._context.fill();
                this._context.stroke();
            } else if (checkDotIndex == i) {
                // 移动的点
                this._context.strokeStyle = this.fillColor;
                this._context.arc(points[i][0], points[i][1], this.circleRadius, 0, 2 * Math.PI, true);
                this._context.fillStyle = this.strokeColor;
                this._context.fill();
                this._context.stroke();
            }
        }
        return this;
    }
    /**
     * 返回当前点击的点 在哪条路径中
     * @param {Object} currentPoint
     */
    checkDotInPath(coordinates, currentPoint) {
        for (let i = coordinates.length - 1; i > -1; --i) {
            if (this.isPointInPath(coordinates[i].paths, currentPoint)) {
                return i;
            }
        }
        return -1;
    }

    /**
 * 绘制自动检测的点坐标
 * @param {Object} params
 */
    drawMouseMovePoints(currentCheckedInfo) {


        this.drawAllCheckedPath(null, this.checkedIndex);
        if (currentCheckedInfo && currentCheckedInfo.dot) {
            const dot = currentCheckedInfo.dot;
            const x = dot[0];
            const y = dot[1];
            this._context.beginPath();
            this._context.moveTo(x, y);
            this._context.fillStyle = this.strokeColor;
            this._context.arc(x, y, this.circleRadius, 0, 2 * Math.PI, false);
            this._context.fill();
        }
        return this;
    }

    imageDargEndCallback = (coordinates = [], coordinate = [], loc) => {

        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        this.createMovePolygonPath(loc);
    }

    mouseDown(coordinates, coordinate, loc) {
        try {

            this.coordinates = this.formateCoordinatesScale(coordinates);
            this.coordinate = this.formateCoordinateScale(coordinate);


            const checkedIndex = this.checkDotInPath(this.coordinates, loc);
            console.log(checkedIndex, this.currentCheckedInfo, 'currentCheckedInfo');



            if (Object.keys(this.currentCheckedInfo).length <= 0 || checkedIndex == -1) {
                console.log(Object.keys(this.currentCheckedInfo).length <= 0, checkedIndex == -1, checkedIndex);

                // 说明当前点并不是在线上
                this.checkedIndex = checkedIndex;
                if (checkedIndex == -1 || this.coordinate.length > 0) {
                    // 证明没有面被选中
                    // 当成点存储
                    console.log('add loc');

                    this._emit('addLocToCoordinate', loc);
                    this.preAddLoc = loc;
                    this.createMovePolygonPath(loc);
                } else {
                    // 点在面上
                    const currentCheckedInfo = this.calcDotNearLine(
                        this.coordinates,
                        checkedIndex,
                        loc,
                        10
                    );

                    this.currentCheckedInfo = currentCheckedInfo;

                    if (this.currentCheckedInfo.index > -1) {
                        // 说明存在靠近鼠标点线段， 即需要点 线匹配
                        this.editPoints(this.currentCheckedInfo);
                    } else {
                        //没有靠近鼠标点的线段 即鼠标点在平面中

                        this.drawAllCheckedPath(null, this.checkedIndex);
                    }
                }
            } else if (Object.keys(this.currentCheckedInfo).length > 0) {
                const { dot } = this.currentCheckedInfo;

                if (Math.abs(dot[0] - loc[0]) < this.threshold && Math.abs(dot[1] - loc[1]) < this.threshold) {
                    // 当前点在线上
                    if (this.checkedIndex === checkedIndex) {
                        if (this.currentCheckedInfo.index > -1) {
                            this.moveLayersFlag = true;
                            // 说明存在靠近鼠标点线段， 即需要点 线匹配
                            this.editPoints(this.currentCheckedInfo);
                            return;
                        }
                    }
                }
                // 没有选中的路径
                this.checkedIndex = checkedIndex;
                this.drawAllCheckedPath(null, this.checkedIndex);
                this.currentCheckedInfo = {};


            }
        } catch (e) {
            throw new Error(e);
        }
    }

    mouseMove(coordinates, coordinate, loc) {
        try {
            this.coordinates = this.formateCoordinatesScale(coordinates);
            this.coordinate = this.formateCoordinateScale(coordinate);
            const { checkedIndex } = this;


            if (this.coordinate.length > 0) {
                // 说明是正在绘制新的图形
                this.createMovePolygonPath(loc);
                return;
            } else {
                if (checkedIndex > -1) {
                    const currentCheckedInfo = this.calcDotNearLine(this.coordinates, checkedIndex, loc, 10);

                    if (currentCheckedInfo.index > -1) {
                        // 点在线附近
                        this.drawMouseMovePoints(currentCheckedInfo);
                        this.currentCheckedInfo = currentCheckedInfo;
                        return;
                    }
                }
                this.drawAllCheckedPath(null, checkedIndex);
                this.currentCheckedInfo = {};
            }
        } catch (e) {
            console.warn(e, 'polygon mousemove')
        }
    }

    mouseMoveDrag(coordinates, coordinate, loc) {
        this.coordinates = this.formateCoordinatesScale(coordinates);
        this.coordinate = this.formateCoordinateScale(coordinate);
        const checkedIndex = this.checkDotInPath(this.coordinates, loc);

        if ((Object.keys(this.currentCheckedInfo).length > 0 && this.checkedIndex == checkedIndex)) {
            this.moveLayersFlag = true;
            this._emit('layersMove', true);
            this.editMovePoints(
                this.currentCheckedInfo,
                loc
            );
        } else {
            this.checkedIndex = checkedIndex;
            this.drawAllCheckedPath(null, this.checkedIndex);
            if (!this.moveLayersFlag) {
                this._emit('layersMove', false, this.preAddLoc);
            }
        }
    }



}

export default PolygonLayer;