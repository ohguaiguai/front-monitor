import tracker from '../utils/tracker';
import onload from '../utils/onload';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';

export function timing() {
  let FMP, LCP;
  if (!PerformanceObserver) return;
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    let perfEntries = entryList.getEntries();
    FMP = perfEntries[0];
    observer.disconnect(); // 不再观察了
  }).observe({ entryTypes: ['element'] }); // 页面中有意义的元素, 需要我们给定

  new PerformanceObserver((entryList, observer) => {
    let perfEntries = entryList.getEntries();
    LCP = perfEntries[0];
    observer.disconnect(); // 不再观察了
  }).observe({ entryTypes: ['largest-contentful-paint'] }); // 页面中最大的那个元素，浏览器自己可以判断

  new PerformanceObserver((entryList, observer) => {
    let lastEvent = getLastEvent();
    let perfEntries = entryList.getEntries();
    let firstInput = perfEntries[0];
    console.log('FID', firstInput);

    if (firstInput) {
      // 我打你到你感到痛
      // 你痛的持续时间
      let inputDelay = firstInput.processingStart - firstInput.startTime; // 从用户点击开始到响应
      let duration = firstInput.duration; // 响应开始到响应结束

      if (inputDelay > 0 || duration > 0) {
        // 发送首次输入延迟
        tracker.send({
          kind: 'experience',
          type: 'firstInputDelay',
          inputDelay,
          duration,
          startTime: firstInput.startTime,
          selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
        });
      }
    }
    observer.disconnect(); // 不再观察了
  }).observe({ type: 'first-input', buffered: true }); // 用户的第一次交互

  onload(function () {
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseEnd,
        domLoading, // 开始解析dom
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart
      } = performance.timing;

      // 发送加载时间
      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'timing', // 统计每个阶段的时间
        connectTime: connectEnd - connectStart, // 连接时间
        ttfbTime: responseEnd - requestStart, // 首字节到达时间
        responseTime: responseEnd - requestStart, // 响应的读取时间
        parseDOMTime: loadEventStart - domLoading, // DOM解析时间
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, // DOMContentLoaded 的回调执行完成消耗的时间
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart // 完整的加载时间
      });

      let FP = performance.getEntriesByName('first-paint')[0];
      let FCP = performance.getEntriesByName('first-contentful-paint')[0];
      // 发送性能指标
      // console.log('FP', FP);
      // console.log('FCP', FCP);
      // console.log('FMP', FMP);
      // console.log('LCP', LCP);

      tracker.send({
        kind: 'experience', // 用户体验指标
        type: 'paint',
        firstPaint: FP.startTime,
        firstContentPaint: FCP.startTime,
        firstMeaningfulPaint: FMP.startTime,
        largestContentPaint: LCP.startTime
      });
    }, 3000);
  });
}
