const path = require("path") //nodejs核心模块，专门处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin'); //引入eslint插件 所有插件都是构造函数，用new调用
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

//用来获取处理样式的loader
function getStyleLoader(pre) {
  return [ 
  MiniCssExtractPlugin.loader,//提取css成单独文件
   "css-loader" ,//将css资源编译成commonjs的模块到js中
   {
    loader: "postcss-loader",
    options: {
      postcssOptions: {
        plugins: [
          "postcss-preset-env", // 能解决大多数样式兼容性问题
        ],
      },
    },
  },
  pre,
  ].filter(Boolean);
}

module.exports = {
    //入口 相对路径
    entry: './src/main.js',
    //输出
    output: {
        //文件的输出路径 绝对路径
        //所有文件的输出目录
        //__dirname nodejs变量，代表当前文件的文件夹目录
        path: path.resolve(__dirname,"../dist"), //即webpack_code下的dist
        // 入口文件输出文件名称
        filename: "static/js/main.js",
        //自动清空上次打包内容
        clean:true
    },
    //加载器
    module: {
        rules: [
            // loader的配置
            {
                test: /\.css$/, //只检测.css文件
                use: getStyleLoader(),
            },
            {
                test: /\.less$/,
                //loader: '',//只能使用一个loader
                use: getStyleLoader("less-loader"),
            },
            {
                test: /\.s[ac]ss$/,
                //loader: '',//只能使用一个loader
                use: getStyleLoader("sass-loader"),
            },
            {
                test: /\.styl$/, 
                use: getStyleLoader("stylus-loader"),
            },
            //处理图像
            {
              test:/\.(png|jpe?g|gif|webp|svg)$/,
              type:"asset",
              parser: {
                dataUrlCondition: {
                  //小于10kb的图片转base64
                  //优点：减少请求数量，缺点：体积会更大
                  maxSize: 1000 * 1024,//体积小于10kb会被处理
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
        ),
        new MiniCssExtractPlugin({
          filename: 'static/css/main.css'
        }),
        new CssMinimizerPlugin()
    ],
  
    //模式
    mode: 'production'
}