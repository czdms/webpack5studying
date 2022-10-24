module.exports = {
    //只能预设，能编译es6的语法
    presets: [
        ['@babel/preset-env',{
            useBuiltIns: 'usage', //按需加载，core自动引入相关依赖包
            corejs:{
                version: "3.8",
                proposals: true
            }
        }]
    ]
}