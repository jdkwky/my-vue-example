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
        $imageDom.style.cssText += 'max-width:100%; max-height:100%';
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
