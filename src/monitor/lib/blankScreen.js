import tracker from '../utils/tracker';
import onload from '../utils/onload';

export function blankScreen() {
  let wrapperElements = ['html', '.no-touch', 'body', '#container', '.content'];
  let emptyPoints = 0;
  function getSelector(element) {
    if (!element) return;
    if (element.id) {
      return '#' + element.id;
    } else if (element.className) {
      return element.className
        .split(' ')
        .filter((item) => !!item)
        .map((item) => '.' + item)
        .join(' ');
    } else {
      return element.nodeName.toLowerCase();
    }
  }
  // 判断是否是包裹容器
  function isWrapper(element) {
    if (element) {
      let selector = getSelector(element);
      // 有包裹容器
      if (wrapperElements.indexOf(selector) !== -1) {
        emptyPoints++;
      }
    }
  }
  onload(function () {
    for (let i = 1; i <= 9; i++) {
      // 横坐标上取9个点
      // elementsFromPoint: 第一个参数是横坐标，第二个参数是纵坐标， 视觉视口高度的一半
      let xElements = document.elementsFromPoint(
        (window.innerWidth * i) / 10,
        window.innerHeight / 2
      );

      //  纵坐标上取9个点
      // elementsFromPoint: 第一个参数是横坐标，第二个参数是纵坐标， 视觉视口高度的一半
      let yElements = document.elementsFromPoint(
        window.innerWidth / 2,
        (window.innerHeight * i) / 10
      );

      isWrapper(xElements[0]);
      isWrapper(yElements[0]);
    }
    if (emptyPoints > 18) {
      // 中心元素
      let centerElements = document.elementsFromPoint(
        window.innerWidth / 2,
        window.innerHeight / 2
      );
      tracker.send({
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: window.screen.width + 'X' + window.screen.height,
        viewPoint: window.innerWidth + 'X' + window.innerHeight,
        selector: getSelector(centerElements[0])
      });
    }
  });
}
