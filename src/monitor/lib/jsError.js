import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

export function injectJsError() {
  // 监控全局 未捕获的异常
  window.addEventListener(
    'error',
    function (event) {
      let lastEvent = getLastEvent(); // 获取到最后一个交互事件

      // 这是一个资源
      if (event.target && (event.target.src || event.target.href)) {
        console.log('resource error', event);
        tracker.send({
          kind: 'stability', // 监控指标的大类
          type: 'error', // 小类型
          errorType: 'resourceError', // 资源记载错误
          filename: event.target.src || event.target.href, // 哪个文件
          tagName: event.target.tagName,
          selector: getSelector(event.target) // script、link元素
        });
      } else {
        console.log('js error', event);
        tracker.send({
          kind: 'stability', // 监控指标的大类
          type: 'error', // 小类型
          errorType: 'jsError', // JS执行错误
          message: event.message, // 报错信息
          filename: event.filename, // 哪个文件
          position: `${event.lineno}: ${event.colno}`,
          stack: getLines(event.error.stack),
          selector: lastEvent ? getSelector(lastEvent.path) : '' // 选择器, 代表最后一个操作的元素
        });
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    console.log('promise error', event);
    let lastEvent = getLastEvent();
    let message;
    let reason = event.reason;
    let filename = '';
    let line = 0;
    let column = 0;
    let stack = '';
    if (typeof event.reason === 'string') {
      message = event.reason;
    } else if (typeof event.reason === 'object') {
      message = reason.message;
      // at http://localhost:8081/:21:32
      if (reason.stack) {
        let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/);
        filename = matchResult[1];
        line = matchResult[2];
        column = matchResult[3];
      }
      stack = getLines(reason.stack);
    }
    tracker.send({
      kind: 'stability', // 监控指标的大类
      type: 'error', // 小类型
      errorType: 'promiseError', // JS执行错误
      message, // 报错信息
      filename: filename, // 哪个文件
      position: `${line}: ${column}`,
      stack: stack,
      selector: lastEvent ? getSelector(lastEvent.path) : '' // 选择器, 代表最后一个操作的元素
    });
  });
}

// 去掉堆栈信息中的无用部分
function getLines(stack) {
  return stack
    .split('\n')
    .slice(1)
    .map((item) => item.replace(/^\s+at\s+/g, ''))
    .join('^');
}
