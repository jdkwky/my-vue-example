import BaseBrush from './BaseBrush';
import eventBus from './eventBus';

class RectLayer extends BaseBrush {
    constructor(props){
        super(props);
        this.initOnEvent();
    }
    // 监听事件
    initOnEvent(){
        eventBus._on('changePublicProps',(props)=>{
            this.changePublicProps(props);
        })
    }

    changePublicProps =(props) =>{

        this.initPublicProps({ publicProps: props });
        this.drawExistPath();
        // console.log('changePublicProps', props);
        // this.mouseMove();
    }
    // 绘制已经存在的路径
    drawExistPath(){
        if(this.points && this.points.length > 0){
            this.points.forEach(point=>{
                const { shapeAttributes, type } = point || {};
                if(type == 'rectLayer'){
                    this.initPrivateProps({ privateProps: shapeAttributes } , this._offsetContext);
                    const newPoints = this.formatePointsToScale(shapeAttributes.points);
                    // const newPoints = shapeAttributes.points;
                    this.drawPath(newPoints, this._offsetContext);
                }
                
            });
            this._context.drawImage(this._offsetCanvas,0,0);
        }
        // if(this.points && this.points.length > 0){
        //     this._context.drawImage(this._offsetCanvas,0,0);
        // }
    }

    drawPath(points, context){
        this.initPrivateProps();
        const [point1, point2] = points || []
        const [x, y] = point1 || [];
        const [x1, y1] = point2 || [];
        const width = parseInt(x1 - x) || 0;
        const height  = parseInt( y1 - y) || 0;
        context.beginPath();
        context.rect(x, y, width, height);
        context.stroke(); 
    }
    mouseDown (loc) {
        const point = this.formatePointToOne(loc);
        this.point.push(point);
        if(this.point.length ==2){
            this.mouseUp();
        }

    }
    mouseMove(loc){
        if(this.point.length > 0){
            this.clearCanvas(this._canvas);
            this.drawExistPath();
            
            if(loc){
                const point = this.formatePointToOne(loc);
                const newPoints = this.formatePointsToScale([...this.point, point]);
                // const newPoints = [...this.point, point];
                this.drawPath(newPoints, this._context);
            }
        }else{
            this.drawExistPath();
        }
    }
    mouseUp(){
        // this.drawPath(this.point, this._context);
        this.points.push({
            type: "rectLayer",
            shapeAttributes:{
                points: this.point,
                strokeStyle: this.strokeStyle,
                fillStyle: this.fillStyle
            }
        });
        this.point =[];
        this.drawExistPath();
    }
}


export default RectLayer;