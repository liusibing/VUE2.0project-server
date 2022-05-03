/*
启动模块
1、通过express启动服务
2、通过mongoose链接mongoDB数据库（需要连接上数据库之后再启动服务）
3、使用中间件 
 */

const mongoose = require('mongoose');
const express = require('express');
const path = require('path');
const app = express();

// 声明使用静态中间件
app.use(express.static('public'));

// 声明使用解析post请求的中间件
app.use(express.urlencoded({extended:true}));  //请求体参数是：name=tom&pwd=123

//保证请求来的数据是json形式:{name:tom,pwd:123}
app.use(express.json());   

// 开放路径
app.use('./node_modules',express.static(path.join(__dirname,'./node_modules')))

// 使用路由
const indexRouter = require('./routers');
app.use('/',indexRouter);

// 通过mongoose链接数据库
// 先连接数据库，在启动服务
mongoose.connect('mongodb://localhost/server_stu',{useNewUrlParser:true}).then(()=>{
    console.log("连接数据库成功");
    app.listen('3000',()=>{
        console.log("服务器启动成功，localhost:3000");
    })
}).catch(error=>{
    console.log("连接数据库失败",error);
})
