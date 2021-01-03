import BaseBrush from './BaseBrush';
import eventBus from './eventBus';

class RectLayer extends BaseBrush {
    constructor(props) {
        super(props);
        this.initOnEvent();
    }

    static type = 'rectLayer';

    // 获取当前数据类型的已经绘制的图形数据
    get layerPoints() {
        const points = this.points;
        return points.filter(val => val.type == RectLayer.type) || [];
    }

    // 监听事件
    initOnEvent() {
        eventBus._on('reRender', props => {
            this.reRender(props);
        });
    }

    reRender = props => {
        this.changeUpperProps(props);
        this.drawExistPath();
    };

    // 判断当前点是否在当前路径中
    pointInCurrentPath = (points, loc) => {
        this.drawPath(points, this._editContext, true, false);
        return this.isPointInPath(this._editContext, loc);
    };
    // 只支持单选清空
    // 在众多路径中选出当前点存在的路径
    getIsPointInPath = loc => {
        const layerPoints = this.layerPoints;
        this.checkedPointInfo = null;
        for (let i = 0, len = layerPoints.length; i < len; i++) {
            const info = layerPoints[i];
            const { shapeAttributes } = info || {};
            const isInPathFlag = this.pointInCurrentPath(
                shapeAttributes.points,
                loc
            );
            if (!this.checkedPointInfo && isInPathFlag) {
                info.isChecked = true;
                this.checkedPointInfo = info;
            } else {
                info.isChecked = false;
            }
        }
        this.drawExistPath();
    };

    // 绘制已经存在的路径
    drawExistPath() {
        this.clearCanvas(this._editContext);
        this.clearCanvas(this._context);
        if (this.layerPoints && this.layerPoints.length > 0) {
            this.points.forEach(point => {
                const { shapeAttributes, isChecked } = point || {};
                if (!isChecked) {
                    const newPoints = shapeAttributes.points;
                    this.initPrivateProps(shapeAttributes);
                    this.drawPath(newPoints, this._context);
                } else {
                    this.drawCheckedPoint();
                }
            });
        }
    }
    // 绘制选中的图形
    drawCheckedPoint() {
        if (this.checkedPointInfo) {
            const { shapeAttributes = {} } = this.checkedPointInfo || {};
            this.initPrivateProps(shapeAttributes);
            this.drawPath(
                shapeAttributes.points,
                this._editContext,
                false,
                true
            );
        }
    }

    // 移动中的状态更新
    /**
     *
     * @param {point} downPoint  上一个点的位置
     * @param {point} currentPoint  当前点的位置
     */
    moveStatus = (downPoint, currentPoint) => {
        const checkedPointInfo = this.checkedPointInfo;
        if (checkedPointInfo) {
            const { shapeAttributes } = checkedPointInfo;
            const isInPath = this.pointInCurrentPath(
                shapeAttributes.points,
                currentPoint
            );
            if (isInPath) {
                // 点在平面中
                const [startX, startY] = downPoint;
                const [endX, endY] = currentPoint;
                this.moveLayer([endX - startX, endY - startY]);
                this._editCanvas.style.cursor = 'move';
            }
        }
    };

    drawPath(points, context, isOnlyPath = false, isChecked = false) {
        const newPoints = this.formatePointsToScale(points);
        const [point1, point2] = newPoints || [];
        if (point1) {
            const [x, y] = point1 || [];
            const [x1, y1] = point2 || [];
            const width = parseInt(x1 - x) || 0;
            const height = parseInt(y1 - y) || 0;
            context.beginPath();
            context.rect(x, y, width, height);
            // 只是绘制路径
            if (!isOnlyPath) {
                context.stroke();
                this.drawFirstPoint(point1, context);
            }
            if (isChecked) {
                const selectedPoints = [point1, [x1, y], point2, [x, y1]];
                this.drawCheckedArc(selectedPoints, context);
            }
        }
    }

    mouseDown(loc) {
        const point = this.formatePointToOne(loc);
        if (this.point.length == 0) {
            // 判断当前点是否存在在路径中
            this.getIsPointInPath(loc);
            // 不是选中则是新绘制图形
            if (!this.checkedPointInfo) {
                this.point.push(point);
            }
        } else {
            this.point.push(point);
            if (this.point.length == 2) {
                this.drawOver();
            }
        }
    }

    mouseMove(loc) {
        if (this.point.length > 0) {
            this.clearCanvas(this._editContext);
            if (loc) {
                const point = this.formatePointToOne(loc);
                const newPoints = [...this.point, point];
                this.initPrivateProps();
                this.drawPath(newPoints, this._editContext);
            }
        } else if (this.checkedPointInfo) {
            // 如果存在选中点
            const { shapeAttributes } = this.checkedPointInfo;
            const paths = this.getPaths(shapeAttributes.points);
            const result = this.getLinePointIn(paths, loc);
            console.log(result, 'result');
        }
    }
    getPaths(points) {
        const [point1, point2] = points;
        const [point1X, point1Y] = point1;
        const [point2X, point2Y] = point2;
        return [
            [point1X, point1Y],
            [point2X, point1Y],
            [point2X, point2Y],
            [point1X, point2Y]
        ];
    }
    drawOver() {
        this.points.push({
            id: this.getUniqueCode(),
            type: RectLayer.type,
            shapeAttributes: {
                points: this.point,
                strokeStyle: this.strokeStyle,
                fillStyle: this.fillStyle
            }
        });
        this.point = [];
        this.drawExistPath();
    }

    // 移动
    moveLayer = diffPoint => {
        if (diffPoint) {
            const [diffX, diffY] = this.formatePointToOne(diffPoint);
            const { shapeAttributes } = this.checkedPointInfo || {};
            const { points } = shapeAttributes || {};

            points.forEach(point => {
                const [x, y] = point;
                point[0] = x + diffX;
                point[1] = y + diffY;
            });
            this.clearCanvas(this._editContext);
            this.drawCheckedPoint();
        }
    };
}

export default RectLayer;
