const os = require("os")

const path = require("path") //nodejs核心模块，专门处理路径问题
const ESLintPlugin = require('eslint-webpack-plugin'); //引入eslint插件 所有插件都是构造函数，用new调用
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserWebpackPlugin = require('terser-webpack-plugin')
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const PreloadWebpackPlugin = require('@vue/preload-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const threads = os.cpus().length //cpu核数


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
        // [contenthash:8]使用contenthash，取8位长度
        // 入口文件输出文件名称
        filename: "static/js/[name].[contenthash:8].js",// 入口文件打包输出资源命名方式
        //给打包输出的其他文件命名
        chunkFilename: "static/js/[name].[contenthash:8].chunk.js", // 动态导入输出资源命名方式
        //图片，字体等通过type:asset吃力资源命名方式
        assetModuleFilename: "static/media/[hash][ext][query]",
        //自动清空上次打包内容
        clean:true
    },
    //加载器
    module: {
        rules: [
            // loader的配置
            {
              oneOf: [
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
                // generator: {
                //   //输出图片名称
                //   filename: "static/images/[hash][ext][query]"
                // }
              },
              //处理字体图标
              {
                test:/\.(ttf|woff2?)$/,
                type:"asset/resource",
                // generator: {
                //   //输出名称
                //   filename: "static/media/[hash:10][ext][query]"
                // }
              },
              {
                test: /\.js$/,
                exclude: /node_modules/, //排除node_modules中的js(文件不处理)   
                //include: path.resolve(__dirname,'../src'),  //只处理src下的文件，其他文件不处理           
                use: [
                  {
                    loader:'thread-loader',//开启多进程
                    options: {
                      works:threads,//进程数量
                    }
                  },
                  {
                    loader: 'babel-loader',
                options: {
                 // presets: ['@babel/preset-env']
                 cacheDirectory: true,//开启babel缓存，第二次检查时为改变的文件不需要babel检查，直接走缓存
                 cacheCompression: false,//关闭缓存文件压缩
                 plugins: ["@babel/plugin-transform-runtime"], // 减少代码体积
                  
                }
                  }
                ]
              }
              ]
            }
        ]
    },
    //插件
    plugins: [
        //plugin的配置
        new ESLintPlugin({
          //检测哪那些文件
          context: path.resolve(__dirname,'../src'),
          exclude: "node_modules", //排除node_modules中的js(文件不处理)  
          cache: true,//开启缓存
          cacheLocation: path.resolve(__dirname,"../node_modules/.cache/eslintcache"),
          threads,//开启多进程和进程数量
         
        }),
        new HtmlWebpackPlugin(
          {
            //模板：以public/index.html文件创建新的文件
            //新的文件特点：结构和原来一致，通过插件自动引入
            template:path.resolve(__dirname,'../public/index.html')
          }
        ),
        new MiniCssExtractPlugin({
          filename: "static/css/[name].[contenthash:8].css",
          chunkFilename: "static/css/[name].[contenthash:8].chunk.css",
        }),
        new PreloadWebpackPlugin({
          //提前加载不需要的资源
          // rel: 'preload',
          // as: 'script'
          rel:'prefetch'
        }),
        new WorkboxPlugin.GenerateSW({
          // these options encourage the ServiceWorkers to get in there fast
          // and not allow any straggling "old" SWs to hang around
          clientsClaim: true,
          skipWaiting: true,
        }),
       
        

    ],
    optimization: {
      minimizer: [
        //压缩css
        new CssMinimizerPlugin(),
        //压缩js
        new TerserWebpackPlugin({
          parallel: threads,//开启多进程和进程数量
        }),
         // 压缩图片
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminGenerate,
          options: {
            plugins: [
              ["gifsicle", { interlaced: true }],
              ["jpegtran", { progressive: true }],
              ["optipng", { optimizationLevel: 5 }],
              [
                "svgo",
                {
                  plugins: [
                    "preset-default",
                    "prefixIds",
                    {
                      name: "sortAttrs",
                      params: {
                        xmlnsOrder: "alphabetical",
                      },
                    },
                  ],
                },
              ],
            ],
          },
        },
      }),
      ],
      //代码分割配置
      splitChunks: {
        chunks: "all",
        //其他都用默认值
      },
      runtimeChunk: {
        name: entrypoint => `runtime~${entrypoint.name}.js`,
      },
    },
  
    //模式
    mode: 'production',
    devtool: "source-map",
}