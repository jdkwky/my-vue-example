/**
 *
 * @param {*} points
 * @param {*} currentPoint
 * @param {*} zoom
 * @param {*} diffX
 * @param {*} diffY
 * return 返回当前点是否在路径中(路径中)
 */
function isPointInMutilPath(
    coordinates,
    currentPoint,
    threshold = 10,
    _context
) {
    _context.beginPath();
    _context.moveTo(coordinates[0][0], coordinates[0][1]);
    for (let i = coordinates.length - 1; i > -1; --i) {
        _context.lineTo(coordinates[i][0], coordinates[i][1]);
    }
    _context.closePath();
    if (_context.isPointInPath(currentPoint[0], currentPoint[1])) {
        return true;
    }
    if (_context.isPointInPath(currentPoint[0] - threshold, currentPoint[1])) {
        return true;
    }
    if (
        _context.isPointInPath(
            currentPoint[0] - threshold,
            currentPoint[1] - threshold
        )
    ) {
        return true;
    }
    if (_context.isPointInPath(currentPoint[0] + threshold, currentPoint[1])) {
        return true;
    }
    if (
        _context.isPointInPath(
            currentPoint[0] + threshold,
            currentPoint[1] + threshold
        )
    ) {
        return true;
    }
    if (_context.isPointInPath(currentPoint[0], currentPoint[1] - threshold)) {
        return true;
    }
    if (_context.isPointInPath(currentPoint[0], currentPoint[1] + threshold)) {
        return true;
    }
}

/**
 *  判断是否在矩形路径中
 */
function isPointInRectPath(coordinates, pos, threshold, _context) {
    const [pos1, pos2] = coordinates || [];
    if (pos1 && pos2) {
        _context.beginPath();
        _context.rect(pos1[0], pos1[1], pos2[0] - pos1[0], pos2[1] - pos1[1]);
        if (_context.isPointInPath(pos[0], pos[1])) {
            return true;
        }
        if (_context.isPointInPath(pos[0] + threshold, pos[1])) {
            return true;
        }
        if (_context.isPointInPath(pos[0], pos[1] + threshold)) {
            return true;
        }
        if (_context.isPointInPath(pos[0] + threshold, pos[1] + threshold)) {
            return true;
        }
        if (_context.isPointInPath(pos[0] - threshold, pos[1])) {
            return true;
        }
        if (_context.isPointInPath(pos[0] - threshold, pos[1] - threshold)) {
            return true;
        }
        if (_context.isPointInPath(pos[0] + threshold, pos[1] + threshold)) {
            return true;
        }
        return false;
    }

    return false;
}

/**
     * 计算靠近两个点的斜率
     *
     * @param {Point} line1
     * @param {Point} line2
     */
function _calSlop(line1, line2) {
    if (line1[0] - line2[0] != 0) {
        return parseFloat((line1[1] - line2[1]) / (line1[0] - line2[0]));
    }
    return 0;
}
/**
 * 计算垂线的斜率
 * @param {Number} slop
 */
function _calVerticalSlop(slop) {
    if (slop != 0) {
        return parseFloat(-1 / slop);
    }
    return 0;
}

/**
* 判断点是否在线上
* @param {*} dot 
* @param {*} line 
*/
function isPointInLinePath(line, dot, threshold) {
    const x2 = dot[0] ? dot[0] : 0;
    const y2 = dot[1] ? dot[1] : 0;
    const p1 = line[0];
    const p2 = line[1];
    const [p1X, p1Y] = p1;
    const [p2X, p2Y] = p2;
    let l = threshold + 1;
    let x = 0;
    let y = 0;
    if (
        ((p1X <= x2 && x2 <= p2X) || (p2X <= x2 && x2 <= p1X)) &&
        ((p1Y <= y2 && y2 <= p2Y) || (p2Y <= y2 && y2 <= p1Y))
    ) {
        const slop = _calSlop(p1, p2);
        const verSlop = _calVerticalSlop(slop);

        const x1 = p1[0] || 0;
        const y1 = p1[1] || 0;

        if (slop != 0 && verSlop != 0) {
            if (y2 == slop * x2 + y1 - slop * y1) {
                // 点在当前直线上
                x = x2;
                y = y2;
            } else {
                x = parseFloat(
                    (y2 - y1 + slop * x1 - verSlop * x2) / (slop - verSlop)
                );
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
    }

    if (l < threshold) {
        // 说明是点在线上
        return true;
    }
    return false;
}

function calcArrowH(sp, ep) {
    var theta = Math.atan((ep[0] - sp[0]) / (ep[1] - sp[1]));
    var cep = _scrollXOY(ep, -1 * theta);
    var csp = _scrollXOY(sp, -1 * theta);
    var ch1 = [0, 0];
    var ch2 = [0, 0];
    var l = cep[1] - csp[1];
    ch1[0] = cep[0] + l * 0.025;
    ch1[1] = cep[1] - l * 0.05;
    ch2[0] = cep[0] - l * 0.025;
    ch2[1] = cep[1] - l * 0.05;
    var h1 = _scrollXOY(ch1, theta);
    var h2 = _scrollXOY(ch2, theta);
    return [h1, h2];
}
//旋转坐标
function _scrollXOY(p, theta) {
    return [
        p[0] * Math.cos(theta) + p[1] * Math.sin(theta),
        p[1] * Math.cos(theta) - p[0] * Math.sin(theta)
    ];
}

/**
 * 计算点是否在箭头坐标内
 * @param {*} line 
 * @param {*} dot 
 * @param {*} threshold 
 */
function isPointInArrowPath(line, dot, threshold) {
    const flag1 = isPointInLinePath(line, dot, threshold);
    const lines = calcArrowH(line[0], line[1]);

    const flag2 = isPointInLinePath([lines[0], line[1]], dot, threshold);
    const flag3 = isPointInLinePath([lines[1], line[1]], dot, threshold);

    return flag1 || flag2 || flag3;
}

export {
    isPointInMutilPath,
    isPointInRectPath,
    isPointInLinePath,
    calcArrowH,
    isPointInArrowPath
};
