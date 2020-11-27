import BaseEvent from './BaseEvent';

class BaseBrush extends BaseEvent {
    constructor(props){
        super();
        // 初始化需要的数据信息
        // 放大缩小值
        this.scale = 1;
        // 描边颜色 默认色 蓝色
        this.strokeStyle = "rgba(0,0,255,1)";
        // 填充颜色
        this.fillStyle = "rgba(255,255,255,0.2)";
        // 线宽  默认线宽
        this.lineWidth = 1;
        // 数据信息已经存在的数据信息 二维数组
        this.points = [];
        // 当前正在绘制的数据信息
        this.point = [];
        // 接收上层传递过来的canvas
        this._canvas = null;
        this._context = null;
        // TODO: 其他属性
        this.initPublicProps(props);
        this.initPrivateProps(props);
       
    }

    initPrivateProps(props){
        const { privateProps } = props || {};
        const { strokeStyle,fillStyle,lineWidth } = privateProps || {};
        // 初始化私有属性
        this.strokeStyle = strokeStyle || this.strokeStyle;
        this.fillStyle = fillStyle || this.fillStyle;
        this.lineWidth = lineWidth || this.lineWidth;


        this._context.strokeStyle = this._offsetContext.strokeStyle =  this.strokeStyle;
        this._context.fillStyle =this._offsetContext.fillStyle =  this.fillStyle;
        this._context.lineWidth = this._offsetContext.lineWidth = this.lineWidth;
    }

    initPublicProps (props){
        const {  publicProps } = props || {};
        const { _scale, _context, _canvas, _offsetCanvas,_offsetContext } = publicProps || {};
        if(!_canvas || !_context){
            console.error('canvas && context is undefiend');
            return;
        }
        // 初始化共有属性
        this._scale = _scale || 1; 
        this._context = _context;
        this._canvas = _canvas;
        this._offsetCanvas = _offsetCanvas;
        this._offsetContext = _offsetContext;
    }


    // 清空画布公共方法
    clearCanvas = (canvas) => {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

    }

    // 转换点坐标 可能存在缩放比例  所以需要存相对坐标
    formatePointToOne(point){
        if(this._scale){
            const [ x, y ] = point || [];
            return [
                x / this._scale,
                y/ this._scale
            ]; 
        }
    }
    // 将缩放的坐标在转换成当前缩放状态下的坐标
    formatePointToScale(point){
        if(this._scale){
            const [ x, y ] = point || [];
            return [
                x * this._scale,
                y * this._scale
            ];
        }
    }
    // 将已经存起来的数据信息转换坐标
    formatePointsToScale(points){
        const copyPoints = JSON.parse(JSON.stringify(points));
        const newPoints  = copyPoints && copyPoints.map(point => this.formatePointToScale(point));
        return newPoints || []
    }

    // 每个工具类要实现的方法  
    // 绘制
    paint(){}
}

export default BaseBrush;