const path = require("path") //nodejs核心模块，专门处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin'); //引入eslint插件 所有插件都是构造函数，用new调用
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    //入口 相对路径
    entry: './src/main.js',
    //输出
    output: {
        //文件的输出路径 绝对路径
        //所有文件的输出目录
        //开发模式没有输出
        path: undefined,
        // 入口文件输出文件名称
        filename: "static/js/main.js",
        //自动清空上次打包内容
        // clean:true
    },
    //加载器
    module: {
        rules: [
            // loader的配置
            {
                test: /\.css$/, //只检测.css文件
                use: [//执行顺序：从右到左，从下到上
                "style-loader",//将js中文件通过创建style标签到html文件中生效
                 "css-loader" //将css资源编译成commonjs的模块到js中
                ],
            },
            {
                test: /\.less$/,
                //loader: '',//只能使用一个loader
                use: [
                  //use可以使用多个loader
                  'style-loader',
                  'css-loader',
                  'less-loader',//将less文件编译成css文件
                ],
            },
            {
                test: /\.s[ac]ss$/,
                //loader: '',//只能使用一个loader
                use: [
                  //use可以使用多个loader
                  'style-loader',
                  'css-loader',
                  'sass-loader',//将sass文件编译成css文件
                ],
            },
            {
                test: /\.styl$/, 
                use: [
                "style-loader",
                 "stylus-loader" //将stylus编译成css文件
                ],
            },
            //处理图像
            {
              test:/\.(png|jpe?g|gif|webp|svg)$/,
              type:"asset",
              parser: {
                dataUrlCondition: {
                  //小于10kb的图片转base64
                  //优点：减少请求数量，缺点：体积会更大
                  maxSize: 10000000 * 1024,//体积小于10kb会被处理
                }
              },
              generator: {
                //输出图片名称
                filename: "static/images/[hash][ext][query]"
              }
            },
            //处理字体图标
            {
              test:/\.(ttf|woff2?)$/,
              type:"asset/resource",
              generator: {
                //输出名称
                filename: "static/media/[hash:10][ext][query]"
              }
            },
            {
              test: /\.js$/,
              exclude: /node_modules/, //排除node_modules中的js(文件不处理)            
              loader: 'babel-loader',
              // options: {
              //   presets: ['@babel/preset-env']
                
              // }
            }
        ]
    },
    //插件
    plugins: [
        //plugin的配置
        new ESLintPlugin({
          //检测哪那些文件
          context: path.resolve(__dirname,'../src')
        }),
        new HtmlWebpackPlugin(
          {
            //模板：以public/index.html文件创建新的文件
            //新的文件特点：结构和原来一致，通过插件自动引入
            template:path.resolve(__dirname,'../public/index.html')
          }
        )
    ],
    // 开发服务器 不会输出资源，在内存中编译打包的
  devServer: {
    host: "localhost", // 启动服务器域名
    port: "3000", // 启动服务器端口号
    open: true, // 是否自动打开浏览器
  },
    //模式
    mode: 'development'
}