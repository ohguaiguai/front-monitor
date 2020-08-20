let host = 'cn-beijing.log.aliyuncs.com';
let project = 'testmonitor';
let logStore = 'testmonitor-store';
let userAgent = require('user-agent');

function getExtraData() {
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent)
    // 用户ID
  };
}

class SendTracker {
  constructor() {
    this.url = `http://${project}.${host}/logstores/${logStore}/track`; // 上报路径
    this.xhr = new XMLHttpRequest();
  }
  send(data) {
    let extraData = getExtraData();
    let log = { ...extraData, ...data };
    console.log('最终上报的', log);
    // 阿里云的要求对象的值不能是数字
    for (let key in log) {
      if (typeof log[key] !== 'string') {
        log[key] = JSON.stringify(log[key]);
      }
    }

    this.xhr.open('POST', this.url, true);

    let body = JSON.stringify({
      __logs__: [log]
    });
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0'); // 版本号
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length); // 请求体大小
    //   this.xhr.setRequestHeader('x-log-compresstype:', '0.6.0');
    this.xhr.setRequestHeader('x-log-contentType', 'application/json'); // 请求体类型
    this.xhr.onload = function () {
      //   console.log(this.xhr.response);
    };
    this.xhr.onerror = function (error) {
      //   console.log(error);
    };

    this.xhr.send(body);
  }
}
export default new SendTracker();
