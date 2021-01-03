import BaseEvent from './BaseEvent';

class ImgLayer extends BaseEvent {
  constructor(props) {
    super();
    const $imgLayer = this.initImgLayer(props);
    return $imgLayer;
  }

  initImgLayer(props) {
    const { url } = props || {};
    if (url) {
      return new Promise((resolve) => {
        const $imageDom = document.createElement('img');
        $imageDom.style.cssText += 'width:100%;height:100%;position:absolute;top:0;bottom:0;left:0;right:0';
        $imageDom.src = url;
        const img = new Image();
        img.src = url;
        img.onload = () => {
          $imageDom.originWidth = img.width;
          $imageDom.originHeight = img.height;
          resolve($imageDom);
        };
      });
    } else {
      console.warn('please input image url');
    }
  }
}

export default ImgLayer;
