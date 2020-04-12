import BaseCanvas from './baseCanvas';

class ImageLayer extends BaseCanvas {
    constructor({
        imageUrl,
        ratio,
        ratioStep,
        ratioMaxTimes,
        canvas

    }) {
        super(canvas);
        if (canvas) {
            if (imageUrl) {
                this._context = canvas.getContext('2d');
                this._url = imageUrl;  // img url
                this.CANVASWIDTH = canvas.width;
                this.CANVASHEIGHT = canvas.height;
                this.MINRATIO = this.currentRatio = ratio;   // 最小放大比例 ，当前放大比例
                this.imageOriginWidth = 1;  // 图片原始宽度
                this.imageOriginHeight = 1;  // 图片原始长度
                this.ratioStep = ratioStep || 0.8; // 默认放大缩小比例
                this.maxTimes = ratioMaxTimes || 4; // 最大放大次数
                this.offsetX = 0;
                this.offsetY = 0;
                this.rangeX = 0;
                this.rangeY = 0;
                this.initLayer();
            }
        } else {
            console.error('ImageLayer need canvas ');
        }
    }

    // 更改图片url 重新绘制

    changeUrl = (url) => {
        this._url = url;
    }
    // 初始化图层信息
    initLayer = () => {
        return new Promise((resolve, reject) => {
            this.$imageDom = new Image();
            this.$imageDom.src = this._url;
            this.$imageDom.onload = () => {
                this.imageOriginWidth = this.$imageDom.width;
                this.imageOriginHeight = this.$imageDom.height;
                this.operateImageSize('moderate');
                resolve();
            }
            this.$imageDom.onerror = () => {
                reject();
            }
        })
    }

    // 绘制图片
    drawImage = () => {
        if (this.$imageDom) {
            try {
                this._context.drawImage(
                    this.$imageDom,
                    0,
                    0,
                    this.imageOriginWidth,
                    this.imageOriginHeight,
                    this.offsetX,
                    this.offsetY,
                    this.imageOriginWidth * this.currentRatio,
                    this.imageOriginHeight * this.currentRatio
                );

                return Promise.resolve();

            } catch (e) {
                console.log(e)
            }
        }
    }

    /**
     *
     * 图片放大或者缩小
     * @param {*} type
     * @param {*} e
     * @returns
     * @memberof ImageCanvas
     */
    operateImageSize = (type, e) => {
        if (type == 'reduce' && (this.currentRatio - this.ratioStep + 0.01) < this.MINRATIO) return;
        if (type == 'amplification' && (this.MINRATIO + this.ratioStep * (this.maxTimes - 1)) < this.currentRatio) return;
        let dir = null;
        switch (type) {
            case 'amplification':
                dir = 1;
                break;
            case 'reduce':
                dir = -1;
                break;
            case 'moderate':
                // 用于判断是宽和高哪个与父容器相等
                // eslint-disable-next-line no-case-declarations
                const imageRatio = this.imageOriginWidth / this.imageOriginHeight;
                // eslint-disable-next-line no-case-declarations
                const canvasRatio = this.CANVASWIDTH / this.CANVASHEIGHT;
                if (imageRatio > canvasRatio) {
                    this.currentRatio = this.CANVASWIDTH / this.imageOriginWidth;
                } else {
                    this.currentRatio = this.CANVASHEIGHT / this.imageOriginHeight;
                }

                this.MINRATIO = this.currentRatio;
                if (this.currentRatio > 1) {
                    this.currentRatio = this.MINRATIO = 1;
                }
                break;
        }
        if (dir) {
            // 放大 或者缩小
            this.currentRatio += dir * this.ratioStep;
            console.log(this.currentRatio, this.MINRATIO);

            const centerX = e && e.offsetX || this.CANVASWIDTH / 2;
            const centerY = e && e.offsetY || this.CANVASHEIGHT / 2;

            this.getOffset(centerX, centerY, this.currentRatio, this.ratioStep, dir);

        } else {

            // 自适应
            this.offsetX = (this.CANVASWIDTH - this.imageOriginWidth * this.currentRatio) * 0.5;
            this.offsetY = (this.CANVASHEIGHT - this.imageOriginHeight * this.currentRatio) * 0.5;
        }

        this._emit('changeImgProps', { scale: this.currentRatio, offsetX: this.offsetX, offsetY: this.offsetY });

        this.drawImage();
    }
    // 获取坐标点是否在图片中，如果不在图片中则选择靠近图片一边的位置, 如果再图片的四个顶角外面则采用顶角放大原则
    getOffset = (pointX, pointY, scale, ratio, dir) => {
        if (pointX && pointY) {
            // 获取图片
            const width = this.imageOriginWidth * (scale - ratio * dir);
            const height = this.imageOriginHeight * (scale - ratio * dir);
            const x = this.offsetX;
            const y = this.offsetY;
            if ((pointX < x) && (pointY >= y && pointY <= y + height)
            ) {
                // 1
                this.offsetY = pointY - (pointY - this.offsetY) / (scale - ratio * dir) * scale;
            } else if ((pointX < x) && pointY >= y + height) {
                // 2
                this.offsetX = x;
                this.offsetY = (ratio * dir * this.imageOriginHeight - this.offsetY) * (-1);
            } else if (pointX > x + width && (pointY >= y && pointY <= y + height)) {
                // 5
                this.offsetY = pointY - (pointY - this.offsetY) / (scale - ratio * dir) * scale;
                this.offsetX = (ratio * dir * this.imageOriginWidth - this.offsetX) * (-1);
            } else if ((pointX >= x && pointX <= x + width) && (pointY > y + height)) {
                // 3
                this.offsetX = pointX - (pointX - this.offsetX) / (scale - ratio * dir) * scale;
                this.offsetY = (ratio * dir * this.imageOriginHeight - this.offsetY) * (-1);
            } else if (pointY < y && (pointX >= x && pointX <= x + width)) {
                // 7
                this.offsetX = pointX - (pointX - this.offsetX) / (scale - ratio * dir) * scale;
                this.offsetY = y;
            } else if (pointX > x + width && (pointY > y + height)) {
                // 4
                this.offsetX = (ratio * dir * this.imageOriginWidth - this.offsetX) * (-1);
                this.offsetY = (ratio * dir * this.imageOriginHeight - this.offsetY) * (-1);
            } else if (pointX > x + width && pointY < y) {
                // 6
                this.offsetY = y;
                this.offsetX = (ratio * dir * this.imageOriginWidth - this.offsetX) * (-1);
            } else if (pointX < x && pointY < y) {
                //  8 
                this.offsetX = x;
                this.offsetY = y;
            } else {
                this.offsetX = pointX - (pointX - this.offsetX) / (scale - ratio * dir) * scale;
                this.offsetY = pointY - (pointY - this.offsetY) / (scale - ratio * dir) * scale;
            }
        }
    }

    // 鼠标按下记录当前点信息
    mouseDownStart = (e) => {
        this.rangeX = e.offsetX - this.offsetX;
        this.rangeY = e.offsetY - this.offsetY;
    }

    // 鼠标移动时计算offset值 并重新绘制

    mouseDownMove = (e) => {
        this.offsetX = e.offsetX - this.rangeX;
        this.offsetY = e.offsetY - this.rangeY;
        this._emit('changeImgProps', { scale: this.currentRatio, offsetX: this.offsetX, offsetY: this.offsetY });
        return this.drawImage();
    }

}


export default ImageLayer;