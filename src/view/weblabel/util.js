// 判断两个点之间的线段距离
const pointsLength = (point1, point2) => {
    const [x1, y1] = point1 || [];
    const [x2, y2] = point2 || [];
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

// 获取唯一标识
const getUniqueCode = () => {
    const random = parseInt(Math.random() * 1000) + new Date().getTime();
    return random;
};

// 判断点 是否在线上

// 通过两个点计算斜率
const calSlop = (point1, point2) => {
    if (point1 && point2) {
        const [x1, y1] = point1;
        const [x2, y2] = point2;
        if (x2 - x1 != 0) {
            return parseFloat((y2 - y1) / (x2 - x1));
        }
    }
    return 0;
};

/**
 * 计算当前斜率的垂直线
 * @param {Number} slop
 */
const calVerticalSlop = slop => {
    if (slop != 0) {
        return parseFloat(-1 / slop);
    }
    return 0;
};

// 计算点是否在线段上
const pointIsInLine = (line, point, threshold) => {
    const [point1, point2] = line || [];
    const [p1X, p1Y] = point1 || [];
    const [p2X, p2Y] = point2 || [];

    const [x2, y2] = point || [];
    let x, y;
    let length = threshold||0;
    // 外接矩形方式
    if (
        ((p1X <= x2 && x2 <= p2X) || (p2X <= x2 && x2 <= p2X)) &&
        ((p1Y <= y2 && y2 <= p2Y) || (p2Y <= y2 && y2 <= p1Y))
    ) {
        const slop = calSlop(point1, point2);
        const verSlop = calVerticalSlop(slop);

        if (slop != 0 && verSlop != 0) {
            if (y2 == slop * x2 + p1Y - slop * p1Y) {
                // 点在当前直线上
                x = x2;
                y = y2;
            } else {
                x = parseFloat(
                    (y2 - p1Y + slop * p1X - verSlop * x2) / (slop - verSlop)
                );
                y = parseFloat(slop * x + p1Y - slop * p1X);
            }
        } else {
            // 水平线或者垂直线
            if (p1X == p2X) {
                // 水平线
                x = p1X;
                y = y2;
            } else if (p1Y == p2Y) {
                // 垂直线
                x = x2;
                y = p1Y;
            }
        }
        if (
            ((p1X <= x && x <= p2X) || (p2X <= x && x <= p2X)) &&
            ((p1Y <= y && y <= p2Y) || (p2Y <= y && y <= p1Y))
        ) {
            // 计算点到点的距离
            length = parseInt(Math.sqrt(Math.pow(x2 - x, 2) + Math.pow(y2 - y, 2)));
        }

        if (length < threshold) {
            // 说明是点在线上
            const l1 = parseInt(Math.sqrt(Math.pow(p1X - x2, 2) + Math.pow(p1Y - y2, 2)));
            const l2 = parseInt(Math.sqrt(Math.pow(p2X - x, 2) + Math.pow(p2Y - y, 2)));
            if (l1 < threshold) {
                x = p1X;
                y = p1Y;
                return { vertex: 0 , length: l1 };
            } else if (l2 < threshold) {
                x = p2X;
                y = p2Y;
                return { vertex: 1 , length: l2 };
            }
            return { vertex: -1, length: length }
        }
        return null;
    }


};

export { pointsLength, getUniqueCode, calSlop, calVerticalSlop, pointIsInLine };
