import BaseEvent from './BaseEvent';
import {
    getUniqueCode,
    pointIsInLine
} from './util';

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
        // 当前选中的点的信息
        this.checkedPointInfo = null;
        // 接收上层传递过来的canvas
        this._canvas = null;
        this._context = null;
        // TODO: 其他属性
        const { privateProps , publicProps } = props || {};
        this.initPublicProps(publicProps);
        this.initPrivateProps(privateProps);
    }

    // 初始化私有属性
    initPrivateProps(privateProps){
        const { strokeStyle,fillStyle,lineWidth } = privateProps || {};
        // 初始化私有属性
        this.strokeStyle = strokeStyle || this.strokeStyle;
        this.fillStyle = fillStyle || this.fillStyle;
        this.lineWidth = lineWidth || this.lineWidth;


        this._context.strokeStyle = this._editContext.strokeStyle =  this.strokeStyle;
        this._context.fillStyle =this._editContext.fillStyle =  this.fillStyle;
        this._context.lineWidth = this._editContext.lineWidth = this.lineWidth;

    }

    // 初始化公共属性
    initPublicProps (publicProps){
        const { _scale, _context, _canvas, _editCanvas,_editContext } = publicProps || {};
        if(!_canvas || !_context){
            console.error('canvas && context is undefiend');
            return;
        }
        // 初始化共有属性
        this._scale = _scale || 1; 
        this._context = _context;
        this._canvas = _canvas;
        this._editCanvas = _editCanvas;
        this._editContext = _editContext;
    }

    getUniqueCode(){
        return getUniqueCode()
    }

    // 更改属性值
    changeUpperProps(props){
        const { _scale } = props || {};
        this._scale = _scale
    }


    // 清空画布公共方法
    clearCanvas = (context) => {
        if(context){
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        }
    }

    // 判断 点是否在路径中
    isPointInPath = (context, point) =>{
        if(context && point){
            const [x, y] = point;
            return context.isPointInPath(x,y);
        }
        return false;
    }

    // 转换点坐标 可能存在缩放比例  所以需要存相对坐标
    formatePointToOne(point){
        if(this._scale){
            // const newScale = 1/this._scale;
            const [ x, y ] = point || [];
            return [
                x / this._scale,
                y / this._scale
            ]; 
        }
    }
    // 将单位一坐标在转换成当前缩放状态下的坐标
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
        if(points){
            const copyPoints = JSON.parse(JSON.stringify(points));
            const newPoints  = copyPoints && copyPoints.map(point => this.formatePointToScale(point));
            return newPoints || []
        }
        return [];
    }

    // 绘制第一个点 知道有没有在绘制图像
    drawFirstPoint(point, context){
        context.save();
        const [x, y] = point || [];
        context.beginPath();
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.fillRect( x-3, y-3, 4, 4 );
        context.restore();
    }

    // 绘制选中图形的选中点
    drawCheckedArc(points, context){
        context.save();
        context.fillStyle='red';
        points.forEach(point =>{
            context.beginPath();
            const [x ,y] = point || [];
            context.arc( x, y, 3, 0, 2 * Math.PI);
            context.fill();
        })
        context.restore()
    }

    // 判断点是否在线上并且返回所在的线或者所在的端点
    getLinePointIn(paths, loc){
        const resultList = [];
        const newPaths= this.formatePointsToScale(paths);
        for(let i = 0, len = newPaths.length; i < len; i++){
            const next = i+1>=len? 0: i+1;
            const line = [newPaths[i] , newPaths[next]];
            console.log(newPaths[i],newPaths[next],'line', loc);
            const result = pointIsInLine(line, loc);
            if(result){
                resultList.push({
                    ...result,
                    index: `${i}-${next}`
                });
            }
        }
       const rankResultList =  resultList.sort((val1, val2) => val1.length - val2.length);
       return rankResultList[0]
    }

    // 每个工具类要实现的方法  
    // 绘制
    moveLayer =()=>{

    }
}

export default BaseBrush;