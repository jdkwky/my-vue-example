import BaseEvent from './BaseEvent';
import { replace } from 'core-js/fn/symbol';

class WebLabel extends BaseEvent {
  constructor(props) {
    super();
    this.scale = 1; //放大 缩小倍数
    this.eventList = new Set(); // 存储event信息
    this.$wrap = null;

    // TODO:后续考虑做成 proxy形式
    // this.initModels(props);
    const { wrapId, imgLayer } = props || {};
    const $wrap = document.getElementById(wrapId);
    if ($wrap) {
      //  make $wrap style posioton relative
      // const wrapPosition = $wrap.style.position;
      // $wrap.style.position = wrapPosition == 'relative' ? wrapPosition : 'relative';
      // create a div to wrap
      const $wrapDiv = document.createElement('div');
      $wrapDiv.style.cssText += 'font-size:0;position:relative';
      this.$wrapDiv = $wrapDiv;

      const $canvas = document.createElement('canvas');
      this._canvas = $canvas || {};
      this._context = this._canvas.getContext('2d');
      $canvas.style.cssText += `position:absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index:10;`;
      if (imgLayer) {
        imgLayer.then((imgLayer) => {
          $wrapDiv.appendChild(imgLayer);
          const { clientWidth, clientHeight, originWidth, originHeight } = imgLayer || {};
          this.scale = clientWidth / originWidth;
          this.originWidth = originWidth;
          this.originHeight = originHeight;
          // console.log(clientWidth, clientHeight);
          // resize canvas width and height
          // this.initCanvasSize(clientWidth, clientHeight);
          // TODO:test 放大缩小
          this.scaleCanvas(this.scale, this.scale);
        });
      } else {
        const { clientWidth, clientHeight } = $wrap || {};
        this.initCanvasSize(clientWidth, clientHeight);
      }
      $wrapDiv.appendChild($canvas);
      $wrap.appendChild($wrapDiv);
      this.initCanvasEvent();
    } else {
      console.warn('this is need a id to appent the canvas');
    }
  }
  /**
   * 初始化参数
   * @param {*} props
   */
  initModels(props) {
    const { regionFields } = props || {};
    const { strokeColor, fillColor } = regionFields || {};
    // TODO: 后续增加根据数据类型 点 回显框
    this.strokeColor = strokeColor || 'blue'; // 描边颜色
    this.fillColor = fillColor || 'rgba(255,255,255,0.2)'; // 填充颜色
  }

  // initCanvas($wrap) {}

  initCanvasSize(width, height) {
    const realWidth = width || 0;
    const realHeight = height || 0;
    this._canvas.width = realWidth;
    this._canvas.height = realHeight;
    this.$wrapDiv.style.cssText += `width:${realWidth}px;height:${realHeight}px`;
  }
  // init canvas event
  initCanvasEvent() {
    this._canvas.addEventListener('mousedown', this.handleMouseDown);
    this._canvas.addEventListener('mousemove', this.handleMouseMove);
    this._canvas.addEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown = (e) => {
    this.downPoint = [e.clientX, e.clientY];
    this.eventList.add('mousedown');
  };

  handleMouseMove = (e) => {
    if (this.eventList.has('mousedown')) {
      this.eventList.add('mousemove');
      this.moveImageLayer(e);
      this.downPoint = [e.clientX, e.clientY];
    }
  };

  handleMouseUp = (e) => {
    console.log(this.eventList, 'eventList');
    if (this.eventList.size > 1) {
      console.log(this.eventList, 'move');
      // move
      this.moveImageLayer(e);
    } else {
      // 绘制
      // TODO: 绘制
    }
    this.eventList.clear();
  };
  // 移动
  moveImageLayer(e) {
    const oldLeft = Number(this.$wrapDiv.style.left.replace('px', ''));
    const oldTop = Number(this.$wrapDiv.style.top.replace('px', ''));
    const [startX, startY] = this.downPoint || [];
    const diffX = e.clientX - startX + oldLeft;
    const diffY = e.clientY - startY + oldTop;
    this.$wrapDiv.style.cssText += `left:${diffX}px; top:${diffY}px`;
  }
  scaleCanvas(scalex, scaley) {
    console.log('in this scale');
    this._context.scale(scalex, scaley);
    this._context.rect(10, 10, 100, 100);
    this._context.fill();
    this.initCanvasSize(this.originWidth * scalex, this.originHeight * scaley);
  }
}

export default WebLabel;
