import BaseEvent from './BaseEvent';

import RectLayer from './RectLayer';

import eventBus from './eventBus';


class WebLabel extends BaseEvent {
  constructor(props) {
    super();
    this.scale = this.originScale = 1; //放大 缩小倍数
    this.eventList = new Set(); // 存储event信息
    this.$wrap = null;
    // TODO:后续考虑做成 proxy形式
    const { wrapId, imgLayer } = props || {};
    const $wrap = document.getElementById(wrapId);
    if ($wrap) {
      //  make $wrap style posioton relative
      // create a div to wrap
      const $wrapDiv = document.createElement('div');
      $wrapDiv.style.cssText += 'font-size:0;position:relative';
      // forbiden select
      $wrapDiv.addEventListener('selectstart',()=>false);
      this.$wrapDiv = $wrapDiv;

      const $canvas = document.createElement('canvas');
      this._canvas = $canvas || {};
      this._context = this._canvas.getContext('2d');
      $canvas.style.cssText += `position:absolute;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index:100;`;
       
      if (imgLayer) {
        imgLayer.then((imgLayer) => {
          $wrapDiv.appendChild(imgLayer);
          const { clientWidth, clientHeight, originWidth, originHeight } = imgLayer || {};
          // 计算图片放大缩小比 如果宽比高大 按照高的缩放比例； 如果宽比高小， 按照宽的比例缩放
          const scaleWidth =  clientWidth /  originWidth;
          const scaleHeight = clientHeight / originHeight;
          let scale = 1;
          if(scaleWidth > scaleHeight){
            scale = this.originScale = scaleHeight;
          }else{
            scale = this.originScale = scaleWidth;
          }
          this.originWidth = originWidth;
          this.originHeight = originHeight;
          this.setScale(scale);
        });
      } else {
        const { clientWidth, clientHeight } = $wrap || {};
        this.originWidth = clientWidth || 1;
        this.originHeight = clientHeight || 1;
        const scale = 1;
        this.setScale(scale);
      }
      
      $wrapDiv.appendChild($canvas);
      $wrap.appendChild($wrapDiv);
      this.initCanvasEvent();
      // 初始化props
      this.initProps(props);

    } else {
      console.warn('this is need a id to appent the canvas');
    }
  }

  /**
   * define props
   */
  // 获取公共属性
  get publicProps(){
    return {
      _scale: this.scale , 
      _context: this._context,
      _canvas: this._canvas,
      _offsetCanvas: this.offsetCanvas,
      _offsetContext: this.offsetCanvasContext
    }
  }

  //  设置对应关系
  get layersMap(){
    return {
      rectLayer: RectLayer
    }
  }
  // 设置当前绘制的图层
  set currentLayerName(name){
    const instance = this.getLayerInstanceName(name);
    this.currentLayer = this[instance];
  }

  get offsetCanvas(){
    if(this._offsetCanvas){
        return this._offsetCanvas;
    }
    this._offsetCanvas = document.createElement('canvas');
    return this._offsetCanvas;
  }

  get offsetCanvasContext(){
    const context = this.offsetCanvas.getContext('2d');
    return context;
  }
  
  /**
   * 将传入的props函数解构 赋值到数据中
   * @param {Object} props 
   */
  initProps(props){
    const { scale , paintTools }  = props || {};
    const { max, min, step } = scale || {};
    // 放大缩小大小
    this.maxScale =  max || 10;
    this.minScale = min || 0.25;
    this.scaleStep = step || 0.25;

    // 设置最大  最小 canvas 宽高
    this.maxCanvasSize = 5000;
    this.minCanvasSize = 100;


    // init paint tool

    this.initPaintTools(paintTools);
    
  }

  //  初始化图层实例
  initLayer(name){
    const privateName = this.getLayerInstanceName(name);
    if(this[privateName]){
      return this[privateName];
    }
    const Fnc = this.layersMap[name];
    if(Fnc){
      this[privateName] = new Fnc({ publicProps: this.publicProps });
    }
  }
  // 获取实例名称
  getLayerInstanceName(name){
    return `_${name}`
  }


  /**
   * init paint tools 
   * @param {Array} tools 
   */
  initPaintTools(tools){
    tools && tools.forEach(tool =>{
      this.initLayer(tool);
    });
    this.currentLayerName = tools[0]
  }
  
  // initCanvas($wrap) {}
  initCanvasSize(width, height) {
    const realWidth = width || 0;
    const realHeight = height || 0;
    this._canvas.width = realWidth;
    this._canvas.height = realHeight;
    this.setOffsetCanvasSize();
    this.$wrapDiv.style.cssText += `width:${realWidth}px;height:${realHeight}px`;
  }
  setOffsetCanvasSize(){
    this._offsetCanvas.width= this._canvas.width;
    this._offsetCanvas.height = this._canvas.height;
  }

  // 将坐标转化成相对canvas画布左边
  // windowToCanvas = (x, y) => {
  //   const bbox = this._canvas.getBoundingClientRect(); // 获取canvas元素的边界框
  //   console.log(bbox, 'bbox')
  //   return [
  //       x - bbox.left * (this._canvas.width / bbox.width),
  //       y - bbox.top * (this._canvas.height / bbox.height)
  //   ];
  // }
  // init canvas event
  initCanvasEvent() {
    //
    this._canvas.addEventListener('mousedown', this.handleMouseDown);
    this._canvas.addEventListener('mousemove', this.handleMouseMove);
    this._canvas.addEventListener('mouseup', this.handleMouseUp);
    this._canvas.addEventListener('mouseleave', this.handleMouseUp);
    // 放大缩小
    this._canvas.addEventListener('wheel', this.handleScroll());
  }

  handleMouseDown = (e) => {
    this._dragMouseDown(e);
  };
  // 拖拽函数
  _dragMouseDown = (e) => {
    this.downPoint = [e.clientX, e.clientY];
    this.eventList.add('mousedown');
  };

  handleMouseMove = (e) => {
    this._dragMouseMove(e);
  };

  //  拖拽
  _dragMouseMove = (e) => {
    if (this.eventList.has('mousedown')) {
      this.eventList.add('mousemove');
      this.moveImageLayer(e);
      this.downPoint = [e.clientX, e.clientY];
    }else{
      // 移动
      const loc = [e.offsetX, e.offsetY];
      this.drawMoveStatus(loc);
      
    }
  };

  drawMoveStatus(loc){
    this.currentLayer.mouseMove(loc);
  }


  handleMouseUp = (e) => {
    this._mouseLeave(e);
  };
  // h拖拽
  _mouseLeave = (e) => {
    if (this.eventList.size > 1) {
      // move
      this.moveImageLayer(e);
    } else if(this.eventList.has('mousedown')) {
      // 绘制
      const loc = [e.offsetX, e.offsetY];
      this.currentLayer.mouseDown(loc);
      
    }else{
      console.log('移除');
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
      this._context.scale(scalex, scaley);
      this.initCanvasSize(this.originWidth * scalex, this.originHeight * scaley);
  }

  /**
   * 设置放大缩小值，如果放大或者缩小之后的宽高 超过最大或最小宽高 不支持缩放
   * @param {int} scale 
   */
  setScale(scale){
    if(scale >= this.minScale && scale <= this.maxScale){
      const currentCanvasWidth = this.originWidth * scale;
      const currentCanvasHeight = this.originHeight * scale;
      if( currentCanvasWidth < this.maxCanvasSize 
          && currentCanvasHeight < this.maxCanvasSize 
          && currentCanvasWidth > this.minCanvasSize 
          && currentCanvasHeight > this.minCanvasSize ){
            this.scale = scale;
            // this.currentLayer.initPublicProps({publicProps: this.publicProps});
            this.scaleCanvas(this.scale,this.scale);
            eventBus._emit('changePublicProps', this.publicProps);
          }
    }
  }
  // 滚动缩放
  handleScroll = () => {
    const threshold = 16.6;
    let startTime = +new Date();
    return (e) => {
      const endTime = +new Date();
      if (endTime - startTime > threshold) {
        startTime = endTime;
        const wheelDelta = e.wheelDelta || e.detail;
        let scale = this.scale ;
        if (wheelDelta > 0) {
          // 向上滚动
          scale = this.scale + this.scaleStep ;
        } else {
          //  向下滚动
          scale = this.scale - this.scaleStep;
        }
        this.setScale(scale);
      }
    };
  };
}

export default WebLabel;
