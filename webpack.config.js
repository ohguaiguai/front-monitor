const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
  entry: './src/index.js',
  context: process.cwd(), // 上下文为当前目录
  mode: 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'monitor.js'
  },
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    // 内部启动了一个express服务器
    before(router) {
      router.get('/success', function (req, res) {
        res.json({ id: 1 });
      });
      router.post('/error', function (req, res) {
        res.sendStatus(500);
      });
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      inject: 'head' // 前端监控SDK要放在最前面执行
    })
  ]
};
